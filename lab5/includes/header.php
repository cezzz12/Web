<?php
$pageTitle = $pageTitle ?? 'Vacation Destinations';
$currentPage = basename($_SERVER['SCRIPT_NAME']);
$flash = get_flash();
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($pageTitle) ?></title>
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
<header class="site-header">
    <div class="container header-row">
        <a class="brand" href="index.php">Vacation Manager</a>
        <nav class="nav-links" aria-label="Main navigation">
            <a class="<?= $currentPage === 'index.php' ? 'active' : '' ?>" href="index.php">Home</a>
            <a class="<?= $currentPage === 'browse.php' ? 'active' : '' ?>" href="browse.php">Browse</a>
            <a class="<?= $currentPage === 'add.php' ? 'active' : '' ?>" href="add.php">Add destination</a>
        </nav>
    </div>
</header>

<main class="container page-content">
    <?php if ($flash): ?>
        <div class="alert <?= e($flash['type']) ?>"><?= e($flash['message']) ?></div>
    <?php endif; ?>