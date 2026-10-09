# Vacation Destinations PHP Lab

This is a PHP and MySQL application for managing vacation destinations.

## Features

- Select, insert, update, and delete destinations.
- Uses PDO prepared statements to avoid SQL injection.
- AJAX country browsing in `browse.php`.
- Pagination with maximum 4 destinations per page.
- At least 5 user-facing pages: `index.php`, `browse.php`, `add.php`, `edit.php`, `details.php`, `delete.php`.
- Basic validation and confirmation dialogs.

## Setup

1. Import `schema.sql` into your MySQL database.
2. Edit `config.php` and set your MySQL host, database name, username, and password.
3. Start a PHP server from this folder:

```powershell
php -S localhost:8000
```

4. Open `http://localhost:8000/index.php`.

On the SCS server, your database name, username, and password are usually the same as your SCS account credentials. If the PHP app runs on the SCS web server, `localhost` is often the correct MySQL host.