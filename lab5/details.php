<?php
require_once __DIR__ . '/includes/bootstrap.php';

$id = get_destination_id_from_request();
$destination = $id ? find_destination($id) : null;

if (!$destination) {
    set_flash('Destination not found.', 'error');
    redirect_to('browse.php');
}

$pageTitle = $destination['location_name'];
require __DIR__ . '/includes/header.php';
?>
<article class="details-page">
    <div class="section-heading">
        <div>
            <p class="eyebrow"><?= e($destination['country_name']) ?></p>
            <h1><?= e($destination['location_name']) ?></h1>
        </div>
        <div class="form-actions compact">
            <a class="button secondary" href="browse.php">Back to browse</a>
            <a class="button primary" href="edit.php?id=<?= (int) $destination['id'] ?>">Edit</a>
            <a class="button danger" href="delete.php?id=<?= (int) $destination['id'] ?>">Delete</a>
        </div>
    </div>

    <dl class="details-grid">
        <div>
            <dt>Estimated cost per day</dt>
            <dd><?= e(number_format((float) $destination['estimated_cost_per_day'], 2)) ?></dd>
        </div>
        <div>
            <dt>Tourist targets</dt>
            <dd><?= nl2br(e($destination['tourist_targets'])) ?></dd>
        </div>
        <div class="full-span">
            <dt>Description</dt>
            <dd><?= nl2br(e($destination['description'])) ?></dd>
        </div>
    </dl>
</article>
<?php require __DIR__ . '/includes/footer.php'; ?>