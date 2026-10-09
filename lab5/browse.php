<?php
require_once __DIR__ . '/includes/bootstrap.php';
$pageTitle = 'Browse destinations';
require __DIR__ . '/includes/header.php';
?>
<section class="section-block">
    <div class="section-heading">
        <div>
            <p class="eyebrow">Explore</p>
            <h1>Browse by country</h1>
        </div>
        <a class="button primary" href="add.php">Add destination</a>
    </div>

    <div class="browse-layout" data-browse-app>
        <aside class="country-panel" aria-label="Countries">
            <h2>Countries</h2>
            <div id="country-list" class="country-list" aria-live="polite"></div>
        </aside>

        <section class="destination-panel" aria-label="Destinations">
            <div class="list-toolbar">
                <div>
                    <h2 id="destination-heading">All countries</h2>
                    <p id="destination-summary">Loading destinations...</p>
                </div>
                <div class="pager">
                    <button class="button secondary" type="button" id="previous-page">Previous</button>
                    <span id="page-status">Page 1</span>
                    <button class="button secondary" type="button" id="next-page">Next</button>
                </div>
            </div>
            <div id="destination-list" class="destination-grid" aria-live="polite"></div>
        </section>
    </div>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>
