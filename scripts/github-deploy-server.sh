#!/usr/bin/env bash
# Installed by an administrator at /usr/local/sbin/github-deploy.
# Invoked only through a project-specific forced SSH command.
set -Eeuo pipefail
umask 077
app=${1:-}
command=${2:-}
case "$app" in
  morihome) site=https://moristack.duckdns.org ;;
  moricar) site=https://moricar.duckdns.org ;;
  *) echo 'Unknown application' >&2; exit 2 ;;
esac
[[ "$command" =~ ^deploy\ ([0-9a-f]{40})$ ]] || { echo 'Only deploy <commit SHA> is allowed' >&2; exit 2; }
sha=${BASH_REMATCH[1]}
root="/srv/apps/$app"
[[ "$(realpath "$root")" == "$root" ]] || exit 2
# Shared server: only one application switch/migration runs at a time.
exec 9>/var/lock/moristack-production-deploy.lock
flock -w 1800 9
latest=$(git ls-remote "https://github.com/app-moristack/$app.git" refs/heads/master | cut -f1)
[[ "$latest" == "$sha" ]] || { echo 'Refusing a commit that is no longer master' >&2; exit 3; }
work=$(mktemp -d "/var/tmp/$app-deploy.XXXXXX")
changed=0
previous=''
compose=(docker compose --project-name "$app" --project-directory "$root" --env-file "$root/.env.production" -f "$root/compose.production.yaml")
export IMAGE_TAG=production
finish() {
  result=$?
  trap - EXIT
  if ((result != 0 && changed == 1)) && [[ -n "$previous" ]]; then
    echo 'Deployment failed. Restoring the previous application image and compose configuration.' >&2
    docker tag "$previous" "$app:production"
    cp "$work/previous-compose.yaml" "$root/compose.production.yaml"
    "${compose[@]}" up -d --no-build --wait --wait-timeout 180 app queue </dev/null || true
    echo 'Database migrations are not automatically reversed; the pre-deploy backup is available.' >&2
  fi
  # This directory is created above, never supplied by the caller.
  rm -rf -- "$work"
  exit "$result"
}
trap finish EXIT
# The SSH stream contains one compressed Docker image. No commands or secrets are accepted.
head -c 2147483649 > "$work/image.tar.gz"
[[ $(stat -c %s "$work/image.tar.gz") -le 2147483648 ]] || { echo 'Image exceeds 2 GB limit' >&2; exit 2; }
python3 - "$work/image.tar.gz" "$app:$sha" <<'PY'
import json,sys,tarfile
with tarfile.open(sys.argv[1], 'r:gz') as archive:
    manifest=json.load(archive.extractfile('manifest.json'))
    assert len(manifest)==1 and manifest[0].get('RepoTags')==[sys.argv[2]], 'Unexpected image tags'
PY
bash "$root/scripts/backup-production.sh" </dev/null
previous=$(docker inspect "$app-app-1" --format '{{.Image}}')
docker tag "$previous" "$app:rollback"
cp "$root/compose.production.yaml" "$work/previous-compose.yaml"
docker load < "$work/image.tar.gz"
revision=$(docker inspect "$app:$sha" --format '{{index .Config.Labels "org.opencontainers.image.revision"}}')
[[ "$revision" == "$sha" ]] || { echo 'Image revision mismatch' >&2; exit 2; }
# Fetch only the same immutable public commit that was built by Actions.
curl --fail --silent --show-error --retry 3 --max-time 180 \
  "https://codeload.github.com/app-moristack/$app/tar.gz/$sha" -o "$work/source.tar.gz"
mkdir "$work/source"
python3 - "$work/source.tar.gz" "$work/source" <<'PY'
import sys,tarfile,pathlib
with tarfile.open(sys.argv[1], 'r:gz') as archive:
    for item in archive.getmembers():
        path=pathlib.PurePosixPath(item.name)
        assert not path.is_absolute() and '..' not in path.parts, 'Unsafe source path'
        assert item.isfile() or item.isdir(), 'Source links are not permitted'
    archive.extractall(sys.argv[2], filter='data')
PY
source="$work/source/$app-$sha"
[[ -f "$source/compose.production.yaml" ]] || exit 2
# Preserve server-only configuration, uploaded data, caches and local tooling.
changed=1
rsync -a --delete \
  --exclude='.env' --exclude='.env.*' --exclude='.secrets/' --exclude='.git/' \
  --exclude='storage/' --exclude='bootstrap/cache/' --exclude='public/storage' \
  --exclude='public/build/' --exclude='vendor/' --exclude='node_modules/' \
  --exclude='.last-deployed-sha' \
  "$source/" "$root/"
docker tag "$app:$sha" "$app:production"
"${compose[@]}" config --quiet
"${compose[@]}" up -d --no-build --wait mysql </dev/null
"${compose[@]}" run --rm -T --no-deps app php artisan migrate --force --no-interaction </dev/null
"${compose[@]}" up -d --no-build --wait --wait-timeout 180 app queue </dev/null
curl --fail --silent --show-error --retry 5 --retry-delay 5 --max-time 30 "$site/up" > /dev/null
printf '%s\n' "$sha" > "$root/.last-deployed-sha"
changed=0
# Retain production + rollback; commit images are for this single deployment only.
docker image rm "$app:$sha" >/dev/null
printf 'Deployed %s at %s\n' "$app" "$sha"
