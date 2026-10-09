<?php
$destination = $destination ?? [
    'location_name' => '',
    'country_name' => '',
    'description' => '',
    'tourist_targets' => '',
    'estimated_cost_per_day' => '',
];
$errors = $errors ?? [];
$submitLabel = $submitLabel ?? 'Save destination';
$cancelUrl = $cancelUrl ?? 'browse.php';
?>
<form method="post" class="destination-form" novalidate>
    <div class="form-grid">
        <label for="location_name">Location name</label>
        <div>
            <input id="location_name" name="location_name" type="text" maxlength="120" required value="<?= e($destination['location_name'] ?? '') ?>">
            <?php if (isset($errors['location_name'])): ?><p class="field-error"><?= e($errors['location_name']) ?></p><?php endif; ?>
        </div>

        <label for="country_name">Country</label>
        <div>
            <input id="country_name" name="country_name" type="text" maxlength="100" required value="<?= e($destination['country_name'] ?? '') ?>">
            <?php if (isset($errors['country_name'])): ?><p class="field-error"><?= e($errors['country_name']) ?></p><?php endif; ?>
        </div>

        <label for="estimated_cost_per_day">Estimated cost per day</label>
        <div>
            <input id="estimated_cost_per_day" name="estimated_cost_per_day" type="number" min="1" max="100000" step="0.01" required value="<?= e((string) ($destination['estimated_cost_per_day'] ?? '')) ?>">
            <?php if (isset($errors['estimated_cost_per_day'])): ?><p class="field-error"><?= e($errors['estimated_cost_per_day']) ?></p><?php endif; ?>
        </div>

        <label for="tourist_targets">Tourist targets</label>
        <div>
            <textarea id="tourist_targets" name="tourist_targets" rows="4" required><?= e($destination['tourist_targets'] ?? '') ?></textarea>
            <?php if (isset($errors['tourist_targets'])): ?><p class="field-error"><?= e($errors['tourist_targets']) ?></p><?php endif; ?>
        </div>

        <label for="description">Description</label>
        <div>
            <textarea id="description" name="description" rows="6" required><?= e($destination['description'] ?? '') ?></textarea>
            <?php if (isset($errors['description'])): ?><p class="field-error"><?= e($errors['description']) ?></p><?php endif; ?>
        </div>
    </div>

    <div class="form-actions">
        <button class="button primary" type="submit"><?= e($submitLabel) ?></button>
        <a class="button secondary" href="<?= e($cancelUrl) ?>" data-confirm="Cancel without saving changes?">Cancel</a>
    </div>
</form>