# Vacation Destinations Node.js Lab

This folder contains the Node.js version of the PHP `lab5` problem, with session-based authentication and the same CRUD API contract used by the shared Angular frontend.

## What is included

- Session login/logout with a username and password stored in the database
- Protected pages and protected `/api/*` endpoints
- SQLite-backed destinations CRUD with validation, pagination, and country browsing
- The same Angular frontend used by the PHP lab, copied into the Node.js app
- Automatic item selection for edit/delete from the list, plus confirmation dialogs

## Demo credentials

- Username: `traveladmin`
- Password: `Travel123!`

## Start the app

1. Run `.\start_lab9.ps1`
2. Open [http://127.0.0.1:5110/login](http://127.0.0.1:5110/login)
3. Log in with the demo account above

To stop the server, run `.\stop_lab9.ps1`.

## Shared frontend

The shared frontend remains the same UI used in the PHP lab.

- PHP build target: `C:\Users\Cezar\Web_Programming_Projects\lab5\ng`
- Node.js build target: `C:\Users\Cezar\Web_Programming_Projects\lab9\public`

The frontend reads its backend from `app-config.js`:

```js
window.APP_CONFIG = {
  apiBaseUrl: 'http://127.0.0.1:5110',
};
```

To demonstrate the requirement from the lab, use the same frontend and change only `apiBaseUrl`:

- `http://127.0.0.1:8000` for PHP
- `http://127.0.0.1:5110` for Node.js

## Important routes

- Login page: `/login`
- Logout route: `/logout`
- Session status API: `/api/session.php`
- Logout API: `/api/logout.php`
- Countries API: `/api/countries.php`
- Destinations API: `/api/destinations.php`

## Backend notes

- Runtime: Node.js 24
- Database: SQLite
- Database file: `data\lab9.sqlite`

The app creates the database, tables, seed user, and seed destinations automatically on first run.
