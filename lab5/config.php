<?php
// Configure these values for the SCS MySQL account before running on the server.
// The database name, username, and password are usually identical to your SCS username/password.
return [
    'port' => getenv('DB_PORT') ?: '3306',
    'host' => getenv('DB_HOST') ?: '127.0.0.1',
    'database' => getenv('DB_NAME') ?: 'vacation_destinations',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASS') ?: '',
    'charset' => 'utf8mb4',
];