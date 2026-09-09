# MoriHome

**Local professionals. A stronger tomorrow.**
A trusted directory of construction, renovation, maintenance and home-service professionals for Mauritius —
built mobile-first and installable as a Progressive Web App.

Visitors search by service and location, compare nearby professionals sorted by real distance, and open a
WhatsApp conversation in one tap. Professionals register themselves, but **no listing is publicly
discoverable until an administrator approves it**.

---

## Contents

- [Stack](#stack)
- [Architecture decisions](#architecture-decisions)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Everyday commands](#everyday-commands)
- [Seed data & credentials](#seed-data--credentials)
- [API](#api)
- [PWA notes](#pwa-notes)
- [Testing](#testing)
- [Production deployment](#production-deployment)
- [Roadmap hooks](#roadmap-hooks)

---

## Stack

| Layer | Choice |
| --- | --- |
| Backend | Laravel 13, PHP 8.3+ |
| REST conventions | `lomkit/laravel-rest-api` for admin search/CRUD; explicit controllers everywhere else |
| Auth | Laravel Sanctum, cookie-based SPA sessions |
| Roles | `spatie/laravel-permission` (`admin`, `provider`) |
| Database | MySQL 8.4 (MariaDB-compatible SQL) |
| Frontend | React 19 + TypeScript, Vite 8, Tailwind CSS 4 |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod |
| Icons / motion | lucide-react, CSS transitions honouring `prefers-reduced-motion` |
| PWA | `vite-plugin-pwa` (Workbox), root-scope service worker |
| Quality | Pint, PHPUnit, ESLint, Prettier, Vitest, Testing Library |

---

## Architecture decisions

These were the choices with more than one reasonable answer. Each picked the simplest production-suitable
option rather than the most flexible one.

### 1. Flat `app/` layout

Domain code sits in `app/Actions`, `app/Services`, `app/Enums`, `app/Support`, `app/Policies` and `app/Rest`.
Controllers stay thin; business rules live in single-purpose action classes (`ModerateProvider`,
`RegisterProvider`, `UpdateProviderProfile`, …) that are trivial to unit-test and reuse.

### 2. Single origin, Sanctum cookie sessions

Laravel serves the built SPA, so the API and the app share an origin. That gives httpOnly session cookies
(no token in `localStorage`), real CSRF protection, and no CORS configuration. In development Vite runs on
`:5173` and the stateful-domain list covers it.

`config/sanctum.php` was modified so the application's own origin is **always** in the stateful list, even
when `SANCTUM_STATEFUL_DOMAINS` is set — a missing origin there silently breaks login with
"Session store not set on request".

### 3. SEO without SSR

The spec mandates a Laravel REST API with a separate React SPA; adopting Next.js for SSR would contradict
that. Instead `SpaController` + `PageMetaResolver` render **per-route metadata server-side** into the Blade
shell:

- real `<title>` and `<meta name="description">` per route
- Open Graph + Twitter card tags with a generated social image
- JSON-LD (`WebSite` on the home page, `LocalBusiness` on profiles)
- a `<noscript>` block with the profile's heading, description and service list
- `noindex` on search results, dashboards, and any non-approved profile
- `/sitemap.xml` listing static pages, categories and every approved provider

Crawlers therefore get meaningful, indexable HTML for public pages while the app stays a clean SPA.

### 4. Radius search: bounding box + Haversine

`ProviderSearch` narrows candidates with a bounding box on the indexed `latitude` / `longitude` columns,
then computes exact distance with a Haversine expression, filters with `HAVING`, and orders by it. This is
index-backed, portable across MySQL and MariaDB, and avoids SRID and spatial-index pitfalls.

Ranking is `is_featured` → `is_verified` → distance, so paid placement and ratings can be slotted in later
without rewriting the query.

### 5. Swappable geocoding

`App\Services\Geocoding\Geocoder` is an interface. The default is a `ChainGeocoder` that tries a local
`LocalityGeocoder` (30 seeded Mauritian localities — instant, offline, no API limits) before falling back to
a cached Nominatim driver. Swapping in Google or Mapbox means writing one class and changing
`GEOCODER_DRIVER`. **Coordinates are stored at registration; search never re-geocodes a provider.**

### 6. Images: client-side downscaling

The runtime has no GD/Imagick, so images are resized in the browser (`resources/js/lib/compressImage.ts`)
before upload — which also saves mobile data. The server validates MIME type, size and dimensions
(`getimagesize()`, no extension needed) and stores the original on the `public` disk.
Installing `php-gd` later would let you add server-side variants; nothing depends on that today.

### 7. Privacy of location

`Provider::$hidden` excludes `latitude` / `longitude`. Public API resources expose only the locality and
coordinates rounded to 2 decimals (~1 km), and the exact address is never serialised publicly. This is
covered by tests.

---

## Local setup

**Requirements:** PHP 8.3+, Composer 2, Node 22+, Docker (for MySQL) — or your own MySQL 8 / MariaDB.

```bash
git clone <repo> morihome && cd morihome

cp .env.example .env
docker compose up -d          # MySQL 8.4 on host port 3310

composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link

npm install
npm run icons                 # regenerates PWA icons from resources/images/logo.png
npm run build
```

Then run everything with one command:

```bash
composer dev                  # Laravel + queue worker + Vite, concurrently
```

Or `composer setup` to do all of the above in one step.

The app is at <http://localhost:8000>.

> **Note:** migrations create the schema **and** the reference data that code depends on — roles, the 30
> Mauritian localities, and the 20 service categories. `db:seed` only adds the admin account and (outside
> production) fictional demo providers.

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `APP_URL` | Canonical URL. Feeds Sanctum's stateful list, canonical tags and the sitemap. |
| `DB_*` | MySQL connection. `DB_PORT` also drives the Docker port mapping. |
| `SANCTUM_STATEFUL_DOMAINS` | Hosts allowed to use cookie sessions. Include every dev port you use. |
| `FRONTEND_URL` | Vite dev server origin. |
| `GEOCODER_DRIVER` | `nominatim` (chained with localities) or `locality` (offline only). |
| `GEOCODER_NOMINATIM_URL` | Nominatim base URL. Self-host it for production traffic. |
| `GEOCODER_NOMINATIM_EMAIL` | Contact address sent in the User-Agent, as Nominatim's policy requires. |
| `GEOCODER_CACHE_TTL` | Seconds to cache geocoding results (default 7 days). |
| `GEOCODER_COUNTRY_CODE` | ISO code to bias results (`mu`). |
| `MORIHOME_DEFAULT_RADIUS_KM` | Radius pre-selected in the search module (default 10). |
| `MORIHOME_MAX_RADIUS_KM` | Hard cap enforced by validation (default 50). |
| `MORIHOME_REVIEW_ON_SENSITIVE_EDIT` | When true, editing identity/location/services returns an approved profile to review. |
| `MORIHOME_WHATSAPP_TEMPLATE` | Prefilled message. Supports `:app` and `:service`. |
| `MORIHOME_SUPPORT_EMAIL` / `_WHATSAPP` | Shown in the footer and contact page. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used by `AdminSeeder`. Leave the password blank to have one generated and printed. |
| `FILESYSTEM_DISK` | `public` locally; use `s3` in production. |

---

## Everyday commands

```bash
composer dev            # Laravel + queue + Vite together
composer test           # PHPUnit
composer lint           # Pint (writes)
composer check          # Pint --test + PHPUnit

npm run dev             # Vite only
npm run build           # Type-check, bundle, generate the service worker
npm run validate        # ESLint + tsc + Vitest
npm run icons           # Rebuild PWA icons from the source logo
```

---

## Seed data & credentials

`php artisan db:seed` creates:

- **1 admin** — `ADMIN_EMAIL` (default `admin@morihome.mu`). Set `ADMIN_PASSWORD` in `.env`, or leave it
  empty and the seeder prints a generated password once. **Never commit a production password.**
- **24 fictional providers** across Port Louis, Curepipe, Grand Baie, Flic en Flac, Mahebourg, Centre de
  Flacq, Souillac, Tamarin and more — deliberately spread across the island so radius search is
  demonstrable. They cover every approval state: 18 approved (several verified/featured), 3 pending,
  1 rejected, 1 suspended, 1 draft.

Every provider is fictional. Demo seeding is skipped when `APP_ENV=production`.

Try it: search **Curepipe** within 10 km, then widen to 30 km and watch the result set grow.

---

## API

Versioned under `/api/v1`. Responses use Laravel API Resources (`data`, plus `meta`/`links` when paginated)
and conventional status codes. Validation errors return 422 with an `errors` map.

### Public (no account)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/categories` | `?popular_only=1` for the home grid |
| GET | `/localities` | Seeded Mauritian localities |
| GET | `/geocode/suggest` | Address autocomplete |
| GET | `/geocode/reverse` | Coordinates → locality |
| GET | `/providers/search` | Category + coordinates/address + radius + filters, paginated |
| GET | `/providers/{slug}` | Approved, active profiles only |
| POST | `/providers/{slug}/contact-events` | Records a WhatsApp click. Never stores message content. |

### Auth

`POST /register`, `POST /login`, `POST /logout`, `GET /user`, `PUT /password`,
`POST /forgot-password`, `POST /reset-password`.

Providers sign in with their **mobile number or email** — email is optional at registration, so the phone
number is the primary identifier (stored E.164).

### Provider (own listing)

`GET|PUT /provider/profile`, `POST /provider/profile/submit`, `POST /provider/profile/images/{logo|cover}`,
`GET|POST /provider/portfolio`, `PUT /provider/portfolio/order`, `DELETE /provider/portfolio/{image}`,
`PUT /provider/opening-hours`.

### Admin

`GET /admin/dashboard`, `GET /admin/providers/{id}`, `GET /admin/providers/{id}/history`,
`POST /admin/providers/{id}/{approved|rejected|suspended|reactivated}`, `GET|PUT /admin/settings`.

Lomkit powers the filtered review queue and category CRUD:
`POST /admin/rest/providers/search` (read-only by design) and
`/admin/rest/service-categories/{search,mutate,actions}`.

> Provider moderation is deliberately **excluded** from Lomkit's `mutate` endpoint. Approval can only change
> through the explicit admin actions, which enforce the state machine and write an audit record.

### Rate limits

`auth` 10/min · `contact-events` 20/min · `geocoding` 30/min · `public` 90/min · `api` 120/min.

### Security model

- Every protected action is authorised server-side (`ProviderPolicy`, `EnsureUserIsAdmin`, `EnsureUserIsProvider`).
- `approval_status`, `slug`, `is_verified` and `is_featured` are **not fillable**; actions set them explicitly.
  Tests assert a registration payload cannot self-approve.
- `Model::shouldBeStrict()` is on outside production, so a mass-assignment slip fails loudly in tests.
- Moderation writes to `provider_moderation_events` with actor, transition and reason.
- Invalid state transitions return 409; rejection without a reason returns 422.

### API documentation

Lomkit publishes an OpenAPI document for its resources at **`/api-documentation`**.

---

## PWA notes

- Manifest at `/build/manifest.webmanifest`: standalone display, `#F5C518` theme, portrait orientation,
  maskable 192/512 icons, and app shortcuts for Search and Register.
- Service worker at **`/sw.js`** — root scope, so it controls every navigation. It precaches the app shell
  and static assets, serves `/offline.html` when a navigation fails, and caches uploaded media.
  **Provider and search responses are never served stale**; `/api/*` is excluded from the navigation fallback.
- Updates use `registerType: 'prompt'`: a toast offers a reload rather than swapping code mid-session.
- iOS never fires `beforeinstallprompt`, so `useInstallPrompt` detects iOS and shows Share → *Add to Home
  Screen* instructions instead. `/install` has full instructions for both platforms.
- Apple meta tags, `viewport-fit=cover` and `env(safe-area-inset-*)` padding keep the standalone iPhone
  layout clear of the notch and home indicator.
- Deep links work identically in the browser and the installed app, because the server resolves every route.

Re-run `npm run build` after changing anything the service worker precaches.

---

## Testing

```bash
composer test    # 131 backend tests
npm run test     # 27 frontend tests
```

Backend tests run against **MySQL** (`morihome_testing`, configured in `phpunit.xml`) because search relies
on SQL trigonometric functions. Create it once:

```bash
docker exec morihome-mysql mysql -uroot -p"$DB_PASSWORD" -e 'CREATE DATABASE IF NOT EXISTS morihome_testing;'
```

What is covered:

- **Unit** — Haversine distance and bounding boxes against real Mauritian coordinates; E.164 phone parsing
  for local, spaced, prefixed and international formats; the approval state machine.
- **Feature** — registration and its validation; login by phone *or* email; rate limiting; the radius filter
  and every search filter; **that unapproved, suspended, inactive and soft-deleted providers never appear**;
  that exact coordinates and moderation fields never reach the public API; the approve/reject/suspend/
  reactivate workflow and its audit trail; authorization boundaries; the sensitive-edit re-review rule;
  upload validation; SEO metadata and SPA route serving.
- **End-to-end** — `CriticalPathTest` walks the whole journey: a provider registers → submits → is invisible
  → an admin approves → the provider appears in a radius search → a customer opens the profile → a correctly
  formatted WhatsApp contact is recorded.
- **Frontend** — WhatsApp URL and message generation, search-state URL round-tripping, and the provider card
  (distance formatting, badges, and the WhatsApp hand-off).

Uploads are tested with real PNG bytes generated in `tests/Support/FakeImage.php`, since
`UploadedFile::fake()->image()` needs GD.

---

## Production deployment

1. **Environment** — `APP_ENV=production`, `APP_DEBUG=false`, a fresh `APP_KEY`, real `APP_URL` (HTTPS).
   Confirm `SANCTUM_STATEFUL_DOMAINS` contains your production host.
2. **Build** — `composer install --no-dev --optimize-autoloader`, then `npm ci && npm run build`.
3. **Migrate** — `php artisan migrate --force`. This also inserts roles, localities and categories.
4. **Admin** — set `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then `php artisan db:seed --class=AdminSeeder`.
   Demo providers are skipped automatically in production.
5. **Cache** — `php artisan config:cache route:cache view:cache`.
6. **Storage** — `php artisan storage:link`, or set `FILESYSTEM_DISK=s3` and configure the bucket. Uploads
   live under `providers/{id}/`.
7. **Queue** — run `php artisan queue:work` under supervisor (used for notifications as they are added).
8. **HTTPS is required** — service workers, the install prompt and secure cookies all depend on it.
9. **Headers** — serve `/sw.js` with `Cache-Control: no-cache` so updates are picked up promptly.
10. **Backups** — back up the database and the uploads disk. Moderation history lives in the database and is
    the audit record.
11. **Logging** — ship `storage/logs` or set `LOG_CHANNEL=stderr` when running in containers.

### Optional hardening

- Install `php-gd` to enable server-side image variants.
- Self-host Nominatim, or switch `GEOCODER_DRIVER` to a commercial provider, before significant traffic —
  the public instance rate-limits heavily.

---

## Roadmap hooks

The schema and query layer already accommodate these without restructuring:

- **Ratings & reviews** — add a `reviews` table; `ProviderSearch::applySort` is the single place ranking changes.
- **Featured / paid placement** — `is_featured` exists and already leads the recommended ordering.
- **Request a quote** — one job request fanned out to matching providers reuses `ProviderSearch`.
- **Lead analytics** — `contact_events` records channel, category and day-bucketed session hash already.
- **Localisation** — all user-facing strings go through `lang/en/*`; components take labels as props, so
  French and Mauritian Creole are additive.
- **Push notifications / native wrappers** — the app is already an installable PWA; Capacitor can wrap it if
  app-store presence is ever needed.

Deliberately **not** built yet, to keep the MVP focused: reviews, quotations, subscriptions, in-app chat,
availability calendars and saved favourites.
