# Production deployment

Push to `master` to run `.github/workflows/deploy-production.yml`. The Actions tab also supports **Run workflow** on `master`. The `production` environment allows only that branch; no manual approval is required.

1. GitHub builds the production Docker image, including TypeScript validation, Vite assets and Composer dependencies. A Laravel CLI check confirms the image can boot.
2. The exact image is streamed over SSH with a pinned host key. No production environment file is uploaded to GitHub.
3. The server validates the commit, image tag and revision label. Deployments across both MoriStack apps share a lock.
4. Database, uploads and configuration are backed up before changes. Source is synchronized from the same immutable GitHub commit; production secrets, uploads and runtime directories are preserved.
5. The image is activated, migrations run, app/queue start, and Docker plus public HTTPS health checks must pass.

Site: https://moristack.duckdns.org
Server directory: `/srv/apps/morihome`
Backup directory: `/var/backups/morihome`
Last successful commit: `/srv/apps/morihome/.last-deployed-sha`
Deployment account: `github-morihome` (forced command, no interactive shell or forwarding).

## Credentials and administration

Repository Actions secrets `PRODUCTION_SSH_KEY` and `PRODUCTION_SSH_HOST_KEY` are configured. The private deployment key is unique to this app. The matching authorized key runs `/usr/local/bin/github-entry-morihome`, which invokes the administrator-installed `/usr/local/sbin/github-deploy`. Its reviewed source is `scripts/github-deploy-server.sh`; changing the repository copy does not automatically replace the privileged receiver.

Production `.env.production` and `.secrets/` stay on the server. Existing administrator SSH access is independent of the pipeline accounts. To revoke deployment access, remove this app's forced authorized key and rotate its GitHub secret.

## Failure and recovery

A failed build never deploys. A failed activation attempts to restore the previous application image and compose configuration; `docker image inspect morihome:rollback` identifies the retained image. Database migrations are **not** automatically reversed. Use backward-compatible migrations; investigate the saved backup before any manual database restore. GitHub marks failed jobs red with logs. No admin or demo seeder runs automatically.

After a successful deployment, one previous image is retained under `morihome:rollback`. Backups use the existing 14-day local retention. Off-server disaster recovery requires separate storage configuration.

## Validation boundary

The pipeline gates production on the Docker build, TypeScript/Vite compilation, Laravel boot and health checks. It does not claim the entire legacy test suite is passing. Run relevant automated tests before merging; MoriCar still has inherited MoriHome fixtures that need updating.

Workflow permissions and secret handling follow [GitHub's deployment guidance](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments).
