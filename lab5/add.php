<?php
require_once __DIR__ . '/includes/bootstrap.php';

$pageTitle = 'Add destination';
$destination = [
    'location_name' => '',
    'country_name' => '',
    'description' => '',
    'tourist_targets' => '',
    'estimated_cost_per_day' => '',
];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    [$destination, $errors] = validate_destination($_POST);

    if (!$errors) {
        $stmt = get_pdo()->prepare(
            'INSERT INTO destinations (location_name, country_name, description, tourist_targets, estimated_cost_per_day)
             VALUES (:location_name, :country_name, :description, :tourist_targets, :estimated_cost_per_day)'
        );
        $stmt->execute([
            ':location_name' => $destination['location_name'],
            ':country_name' => $destination['country_name'],
            ':description' => $destination['description'],
            ':tourist_targets' => $destination['tourist_targets'],
            ':estimated_cost_per_day' => $destination['estimated_cost_per_day'],
        ]);

        set_flash('Destination added successfully.');
        redirect_to('details.php?id=' . get_pdo()->lastInsertId());
    }
}

require __DIR__ . '/includes/header.php';
?>
<section class="section-block narrow">
    <div class="section-heading">
        <div>
            <p class="eyebrow">Create</p>
            <h1>Add destination</h1>
        </div>
    </div>
    <?php
    $submitLabel = 'Add destination';
    $cancelUrl = 'browse.php';
    require __DIR__ . '/includes/destination_form.php';
    ?>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>