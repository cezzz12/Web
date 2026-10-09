<?php
require_once __DIR__ . '/includes/bootstrap.php';

$id = get_destination_id_from_request();
$destination = $id ? find_destination($id) : null;

if (!$destination) {
    set_flash('Destination not found.', 'error');
    redirect_to('browse.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = get_pdo()->prepare('DELETE FROM destinations WHERE id = :id');
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    set_flash('Destination deleted successfully.');
    redirect_to('browse.php');
}

$pageTitle = 'Delete ' . $destination['location_name'];
require __DIR__ . '/includes/header.php';
?>
<section class="section-block narrow">
    <p class="eyebrow">Confirm delete</p>
    <h1>Delete <?= e($destination['location_name']) ?>?</h1>
    <p>This action will permanently remove the destination from the database.</p>

    <div class="delete-summary">
        <strong><?= e($destination['location_name']) ?></strong>
        <span><?= e($destination['country_name']) ?></span>
        <span><?= e(number_format((float) $destination['estimated_cost_per_day'], 2)) ?> per day</span>
    </div>

    <form method="post" class="form-actions">
        <button class="button danger" type="submit" data-confirm="Are you sure you want to delete this destination?">Delete destination</button>
        <a class="button secondary" href="details.php?id=<?= (int) $destination['id'] ?>" data-confirm="Cancel deletion and return to details?">Cancel</a>
    </form>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>