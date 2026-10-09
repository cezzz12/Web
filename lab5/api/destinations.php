<?php
require_once __DIR__ . '/../includes/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
send_api_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

function json_response(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function get_json_body(): array
{
    $rawBody = file_get_contents('php://input');
    if ($rawBody === false || trim($rawBody) === '') {
        return [];
    }

    $decoded = json_decode($rawBody, true);
    return is_array($decoded) ? $decoded : [];
}

function request_id(): int
{
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    return $id && $id > 0 ? $id : 0;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $country = trim((string) ($_GET['country'] ?? ''));
        $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT);
        $page = $page && $page > 0 ? $page : 1;
        $perPage = 4;

        $whereSql = '';
        $params = [];

        if ($country !== '') {
            $whereSql = 'WHERE country_name = :country';
            $params[':country'] = $country;
        }

        $countStmt = get_pdo()->prepare("SELECT COUNT(*) FROM destinations $whereSql");
        foreach ($params as $name => $value) {
            $countStmt->bindValue($name, $value);
        }
        $countStmt->execute();
        $total = (int) $countStmt->fetchColumn();
        $totalPages = max(1, (int) ceil($total / $perPage));
        $page = min($page, $totalPages);
        $offset = ($page - 1) * $perPage;

        $sql = "SELECT id, location_name, country_name, description, tourist_targets, estimated_cost_per_day
                FROM destinations
                $whereSql
                ORDER BY country_name ASC, location_name ASC
                LIMIT :limit OFFSET :offset";
        $stmt = get_pdo()->prepare($sql);
        foreach ($params as $name => $value) {
            $stmt->bindValue($name, $value);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        json_response([
            'success' => true,
            'destinations' => $stmt->fetchAll(),
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => $totalPages,
                'has_previous' => $page > 1,
                'has_next' => $page < $totalPages,
            ],
            'country' => $country,
        ]);
    }

    if ($method === 'POST') {
        [$data, $errors] = validate_destination(get_json_body());

        if ($errors) {
            json_response([
                'success' => false,
                'message' => 'Please check the form fields.',
                'errors' => $errors,
            ], 422);
        }

        $stmt = get_pdo()->prepare(
            'INSERT INTO destinations (location_name, country_name, description, tourist_targets, estimated_cost_per_day)
             VALUES (:location_name, :country_name, :description, :tourist_targets, :estimated_cost_per_day)'
        );
        $stmt->execute([
            ':location_name' => $data['location_name'],
            ':country_name' => $data['country_name'],
            ':description' => $data['description'],
            ':tourist_targets' => $data['tourist_targets'],
            ':estimated_cost_per_day' => $data['estimated_cost_per_day'],
        ]);

        $id = (int) get_pdo()->lastInsertId();
        json_response([
            'success' => true,
            'message' => 'Destination added.',
            'destination' => find_destination($id),
        ], 201);
    }

    if ($method === 'PUT') {
        $id = request_id();
        if (!$id || !find_destination($id)) {
            json_response([
                'success' => false,
                'message' => 'Destination not found.',
            ], 404);
        }

        [$data, $errors] = validate_destination(get_json_body());

        if ($errors) {
            json_response([
                'success' => false,
                'message' => 'Please check the form fields.',
                'errors' => $errors,
            ], 422);
        }

        $stmt = get_pdo()->prepare(
            'UPDATE destinations
             SET location_name = :location_name,
                 country_name = :country_name,
                 description = :description,
                 tourist_targets = :tourist_targets,
                 estimated_cost_per_day = :estimated_cost_per_day
             WHERE id = :id'
        );
        $stmt->bindValue(':location_name', $data['location_name']);
        $stmt->bindValue(':country_name', $data['country_name']);
        $stmt->bindValue(':description', $data['description']);
        $stmt->bindValue(':tourist_targets', $data['tourist_targets']);
        $stmt->bindValue(':estimated_cost_per_day', $data['estimated_cost_per_day']);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        json_response([
            'success' => true,
            'message' => 'Destination updated.',
            'destination' => find_destination($id),
        ]);
    }

    if ($method === 'DELETE') {
        $id = request_id();
        if (!$id || !find_destination($id)) {
            json_response([
                'success' => false,
                'message' => 'Destination not found.',
            ], 404);
        }

        $stmt = get_pdo()->prepare('DELETE FROM destinations WHERE id = :id');
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        json_response([
            'success' => true,
            'message' => 'Destination deleted.',
        ]);
    }

    json_response([
        'success' => false,
        'message' => 'Method not allowed.',
    ], 405);
} catch (Throwable $exception) {
    json_response([
        'success' => false,
        'message' => 'Could not process request.',
    ], 500);
}
