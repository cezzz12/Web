<?php
require_once __DIR__ . '/includes/bootstrap.php';

$id = get_destination_id_from_request();
$destination = $id ? find_destination($id) : null;

if (!$destination) {
    set_flash('Destination not found.', 'error');
    redirect_to('browse.php');
}

$pageTitle = 'Edit ' . $destination['location_name'];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    [$destinationInput, $errors] = validate_destination($_POST);

    if (!$errors) {
        $stmt = get_pdo()->prepare(
            'UPDATE destinations
             SET location_name = :location_name,
                 country_name = :country_name,
                 description = :description,
                 tourist_targets = :tourist_targets,
                 estimated_cost_per_day = :estimated_cost_per_day
             WHERE id = :id'
        );
        $stmt->bindValue(':location_name', $destinationInput['location_name']);
        $stmt->bindValue(':country_name', $destinationInput['country_name']);
        $stmt->bindValue(':description', $destinationInput['description']);
        $stmt->bindValue(':tourist_targets', $destinationInput['tourist_targets']);
        $stmt->bindValue(':estimated_cost_per_day', $destinationInput['estimated_cost_per_day']);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        set_flash('Destination updated successfully.');
        redirect_to('details.php?id=' . $id);
    }

    $destination = array_merge($destination, $destinationInput);
}

require __DIR__ . '/includes/header.php';
?>
<section class="section-block narrow">
    <div class="section-heading">
        <div>
            <p class="eyebrow">Update</p>
            <h1>Edit destination</h1>
        </div>
        <a class="danger-link" href="delete.php?id=<?= $id ?>">Delete</a>
    </div>
    <?php
    $submitLabel = 'Save changes';
    $cancelUrl = 'details.php?id=' . $id;
    require __DIR__ . '/includes/destination_form.php';
    ?>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>