# Vacation destinations — PHP and Angular

A vacation-destination CRUD application with PHP pages, a JSON API, MySQL/MariaDB storage and an Angular frontend.

## How it works

PHP pages render browse/add/edit/details/delete flows. `includes/` provides shared bootstrap, validation and PDO access; `api/` exposes JSON endpoints. `schema.sql` creates and seeds destinations. `angular-ui/` contains the typed frontend used by this and the sibling backends. Database configuration comes from environment variables.

## Architecture

Browser → HTTP routes/API → service/validation → repository/database. The frontend sends destination requests and uses pagination/filter results from the backend.

## Run

Requires PHP with PDO MySQL and a MySQL/MariaDB server. Create a local `vacation_destinations` database and import `schema.sql`. Set configuration through environment variables; no account password is stored in the source. For PowerShell:

```powershell
$env:DB_HOST = "127.0.0.1"
$env:DB_PORT = "3306"
$env:DB_NAME = "vacation_destinations"
$env:DB_USER = "your_database_user"
$env:DB_PASS = "your_database_password"
php -S 127.0.0.1:8000
```

Open `http://127.0.0.1:8000/index.php`. For the Angular interface, install Node/npm, then run `npm ci` and `npm start` in `angular-ui/`; check `proxy.conf.json` points to the PHP server. `npm run build` creates a production bundle.

The older Windows launch scripts expect separately provisioned runtimes under `.runtime/`; those third-party runtimes are intentionally not committed. The commands above use tools installed on PATH.

## API

`GET /api/countries.php` lists countries. `GET /api/destinations.php?country=...&page=...` filters/pages destinations. `POST`, `PUT ?id=...`, and `DELETE ?id=...` create, update and remove records. The Node and ASP.NET variants also require login/session cookies for API access. Destination JSON fields are `location_name`, `country_name`, `description`, `tourist_targets`, and `estimated_cost_per_day`.

## Verification

Checked on 2026-10-09: syntax: passed, frontend build: passed, integration: passed.

PHP lint, Angular production build, pagination, validation and create/update/filter/delete against temporary MariaDB.

## Refinements

- Removed the original account password from configuration and scripts.
- Configured a local sample database using DB_HOST, DB_NAME, DB_USER and DB_PASS environment variables.
- Allowed a configurable MySQL port for portable setup and isolated checks.
- Used the configured MySQL port in the PDO connection.

Original assignment/project notes are preserved in [README.original.md](README.original.md).
