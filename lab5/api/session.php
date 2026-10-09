<?php
require_once __DIR__ . '/../includes/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
send_api_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

echo json_encode([
    'success' => true,
    'authenticated' => false,
]);
