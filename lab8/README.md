# Vacation destinations — ASP.NET

An ASP.NET Core vacation-destination backend with session login, validation, SQL Server persistence and a served Angular frontend.

## How it works

`Program.cs` configures middleware and HTTP endpoints. `SqlDestinationRepository` performs parameterized SQL operations. `DatabaseInitializer` creates/seeds the database. Models and validator/password helpers provide shared logic. The prebuilt frontend is served from `wwwroot/`; source lives in sibling `lab5/angular-ui/`.

## Architecture

Browser → HTTP routes/API → service/validation → repository/database. The frontend sends destination requests and uses pagination/filter results from the backend.

## Run

Requires .NET SDK 9 and SQL Server (the development configuration uses Windows SQL Server LocalDB). Set `ConnectionStrings__VacationDatabase` to your own development SQL Server connection string if needed. From this folder:

```sh
dotnet build VacationDestinationsAspNet
dotnet run --project VacationDestinationsAspNet --urls http://127.0.0.1:5108
```

Open `http://127.0.0.1:5108/login`. Demo credentials are `traveladmin` / `Travel123!`; override `SeedUser__Username` and `SeedUser__Password` for another local setup. The prebuilt UI is included. Rebuild source through sibling `lab5/angular-ui/` and `build_frontend.ps1`.

## API

`GET /api/countries.php` lists countries. `GET /api/destinations.php?country=...&page=...` filters/pages destinations. `POST`, `PUT ?id=...`, and `DELETE ?id=...` create, update and remove records. The Node and ASP.NET variants also require login/session cookies for API access. Destination JSON fields are `location_name`, `country_name`, `description`, `tourist_targets`, and `estimated_cost_per_day`.

## Verification

Checked on 2026-10-09: build: passed, integration: not run.

ASP.NET build succeeded with zero warnings/errors; SQL Server application workflow not exercised.

The backend compiles with zero warnings/errors. The SQL Server application workflow was not run during this audit.

Original assignment/project notes are preserved in [README.original.md](README.original.md).
