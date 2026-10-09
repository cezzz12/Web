# Transport route web application — Java

A Java web application for authenticated users to choose and manage transport routes between neighboring cities.

## How it works

Embedded Tomcat hosts Jakarta servlets and JSP views. An authentication filter guards application routes. Services coordinate authentication and route state; repositories use JDBC with an H2 file database. The bootstrap initializes users, cities and route tables. Data is created under `data/` at runtime.

## Architecture

Browser → HTTP routes/API → service/validation → repository/database. The frontend sends destination requests and uses pagination/filter results from the backend.

## Run

Requires JDK 17 or newer and Maven. From this folder:

```sh
mvn verify
mvn exec:java
```

Open `http://localhost:8080/login`. Sample local users are `traveler` / `Route123` and `planner` / `Journey456`. Change the port with `-Dapp.port=8081`. H2 initializes a fresh database automatically. These accounts are seeded demonstrations.

## Verification

Checked on 2026-10-09: build: passed, integration: passed.

Embedded Tomcat startup, JSP rendering, H2 initialization and session login.

