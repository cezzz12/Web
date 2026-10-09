<?php
function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function redirect_to(string $path): void
{
    header('Location: ' . $path);
    exit;
}

function send_api_cors_headers(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && preg_match('/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i', $origin) === 1) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}

function set_flash(string $message, string $type = 'success'): void
{
    $_SESSION['flash'] = [
        'message' => $message,
        'type' => $type,
    ];
}

function get_flash(): ?array
{
    if (!isset($_SESSION['flash'])) {
        return null;
    }

    $flash = $_SESSION['flash'];
    unset($_SESSION['flash']);
    return $flash;
}

function validate_destination(array $input): array
{
    $data = [
        'location_name' => trim($input['location_name'] ?? ''),
        'country_name' => trim($input['country_name'] ?? ''),
        'description' => trim($input['description'] ?? ''),
        'tourist_targets' => trim($input['tourist_targets'] ?? ''),
        'estimated_cost_per_day' => trim($input['estimated_cost_per_day'] ?? ''),
    ];

    $errors = [];

    if ($data['location_name'] === '' || strlen($data['location_name']) < 2) {
        $errors['location_name'] = 'Location name must contain at least 2 characters.';
    } elseif (strlen($data['location_name']) > 120) {
        $errors['location_name'] = 'Location name cannot exceed 120 characters.';
    }

    if ($data['country_name'] === '' || strlen($data['country_name']) < 2) {
        $errors['country_name'] = 'Country name must contain at least 2 characters.';
    } elseif (strlen($data['country_name']) > 100) {
        $errors['country_name'] = 'Country name cannot exceed 100 characters.';
    }

    if ($data['description'] === '' || strlen($data['description']) < 10) {
        $errors['description'] = 'Description must contain at least 10 characters.';
    }

    if ($data['tourist_targets'] === '' || strlen($data['tourist_targets']) < 3) {
        $errors['tourist_targets'] = 'Add at least one tourist target.';
    }

    if ($data['estimated_cost_per_day'] === '' || !is_numeric($data['estimated_cost_per_day'])) {
        $errors['estimated_cost_per_day'] = 'Estimated cost must be a valid number.';
    } else {
        $cost = (float) $data['estimated_cost_per_day'];
        if ($cost <= 0) {
            $errors['estimated_cost_per_day'] = 'Estimated cost must be greater than 0.';
        } elseif ($cost > 100000) {
            $errors['estimated_cost_per_day'] = 'Estimated cost is unrealistically high.';
        }
        $data['estimated_cost_per_day'] = number_format($cost, 2, '.', '');
    }

    return [$data, $errors];
}

function find_destination(int $id): ?array
{
    $stmt = get_pdo()->prepare('SELECT * FROM destinations WHERE id = :id');
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $destination = $stmt->fetch();

    return $destination ?: null;
}

function get_destination_id_from_request(): int
{
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    return $id && $id > 0 ? $id : 0;
}
