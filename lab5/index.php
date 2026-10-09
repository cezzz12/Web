<?php
require_once __DIR__ . '/includes/bootstrap.php';

$pageTitle = 'Vacation Manager';
$pdo = get_pdo();

$totalDestinations = (int) $pdo->query('SELECT COUNT(*) FROM destinations')->fetchColumn();
$totalCountries = (int) $pdo->query('SELECT COUNT(DISTINCT country_name) FROM destinations')->fetchColumn();
$averageCost = $pdo->query('SELECT AVG(estimated_cost_per_day) FROM destinations')->fetchColumn();

$recentStmt = $pdo->query('SELECT id, location_name, country_name, estimated_cost_per_day FROM destinations ORDER BY created_at DESC, id DESC LIMIT 5');
$recentDestinations = $recentStmt->fetchAll();

require __DIR__ . '/includes/header.php';
?>
<section class="hero-band">
    <div>
        <p class="eyebrow">Travel planner</p>
        <h1>Vacation destinations</h1>
        <p>Keep track of places to visit, daily budgets, and the sights worth seeing.</p>
    </div>
    <div class="hero-actions">
        <a class="button primary" href="add.php">Add destination</a>
        <a class="button secondary" href="browse.php">Browse by country</a>
    </div>
</section>

<section class="stats-grid" aria-label="Destination statistics">
    <div class="stat-box">
        <span class="stat-value"><?= $totalDestinations ?></span>
        <span class="stat-label">Destinations</span>
    </div>
    <div class="stat-box">
        <span class="stat-value"><?= $totalCountries ?></span>
        <span class="stat-label">Countries</span>
    </div>
    <div class="stat-box">
        <span class="stat-value"><?= $averageCost !== null ? e(number_format((float) $averageCost, 2)) : '0.00' ?></span>
        <span class="stat-label">Average daily cost</span>
    </div>
</section>

<section class="section-block">
    <div class="section-heading">
        <h2>Recently added</h2>
        <a href="browse.php">View all</a>
    </div>

    <?php if (!$recentDestinations): ?>
        <p class="empty-state">No destinations yet. Add the first one to start browsing.</p>
    <?php else: ?>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Location</th>
                        <th>Country</th>
                        <th>Cost/day</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($recentDestinations as $destination): ?>
                        <tr>
                            <td><?= e($destination['location_name']) ?></td>
                            <td><?= e($destination['country_name']) ?></td>
                            <td><?= e(number_format((float) $destination['estimated_cost_per_day'], 2)) ?></td>
                            <td class="actions-cell">
                                <a href="details.php?id=<?= (int) $destination['id'] ?>">Details</a>
                                <a href="edit.php?id=<?= (int) $destination['id'] ?>">Edit</a>
                                <a class="danger-link" href="delete.php?id=<?= (int) $destination['id'] ?>">Delete</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>
