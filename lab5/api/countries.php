<?php
require_once __DIR__ . '/../includes/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
send_api_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

try {
    $stmt = get_pdo()->query(
        'SELECT country_name, COUNT(*) AS destination_count
         FROM destinations
         GROUP BY country_name
         ORDER BY country_name ASC'
    );

    echo json_encode([
        'success' => true,
        'countries' => $stmt->fetchAll(),
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not load countries.',
    ]);
}
