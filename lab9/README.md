# Vacation destinations — Node.js

A Node.js vacation-destination web application with session login, SQLite persistence and an Angular frontend.

## How it works

`server.js` implements HTTP routing, cookies and in-memory sessions using Node core modules. `src/database.js` uses node:sqlite and prepared statements. Validation, password hashing and login rendering are separate modules. `public/` serves the frontend; source lives in sibling `lab5/angular-ui/`.

## Architecture

Browser → HTTP routes/API → service/validation → repository/database. The frontend sends destination requests and uses pagination/filter results from the backend.

## Run

Requires Node.js 22.13 or newer with the `node:sqlite` module (verified with Node 24.14.1). No third-party backend packages are required. From this folder:

```sh
npm start
```

Open `http://127.0.0.1:5110/login`. Demo credentials are `traveladmin` / `Travel123!`. Environment variables: `HOST`, `PORT`, `DATABASE_PATH`, `SEED_USERNAME`, `SEED_PASSWORD`. A fresh SQLite database is created and seeded automatically. The prebuilt UI is included; frontend source lives in sibling `lab5/angular-ui/`.

Sessions are held in process memory and expire on restart.

## API

`GET /api/countries.php` lists countries. `GET /api/destinations.php?country=...&page=...` filters/pages destinations. `POST`, `PUT ?id=...`, and `DELETE ?id=...` create, update and remove records. The Node and ASP.NET variants also require login/session cookies for API access. Destination JSON fields are `location_name`, `country_name`, `description`, `tourist_targets`, and `estimated_cost_per_day`.

## Verification

Checked on 2026-10-09: syntax: passed, integration: passed.

Authentication guard, login, pagination, validation and create/update/filter/delete against isolated SQLite.

## Refinements

- Made the database path and demo-user credentials configurable for isolated tests and deployments.

Original assignment/project notes are preserved in [README.original.md](README.original.md).
