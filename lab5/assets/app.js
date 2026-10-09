(function () {
    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    document.addEventListener('click', function (event) {
        var target = event.target.closest('[data-confirm]');
        if (!target) {
            return;
        }

        if (!window.confirm(target.getAttribute('data-confirm'))) {
            event.preventDefault();
        }
    });

    var browseApp = document.querySelector('[data-browse-app]');
    if (!browseApp) {
        return;
    }

    var state = {
        country: '',
        page: 1,
        totalPages: 1
    };

    var countryList = document.getElementById('country-list');
    var destinationList = document.getElementById('destination-list');
    var heading = document.getElementById('destination-heading');
    var summary = document.getElementById('destination-summary');
    var previousButton = document.getElementById('previous-page');
    var nextButton = document.getElementById('next-page');
    var pageStatus = document.getElementById('page-status');

    function countryButton(label, count, value) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'country-button' + (state.country === value ? ' active' : '');
        button.dataset.country = value;
        button.innerHTML = '<span>' + escapeHtml(label) + '</span><strong>' + count + '</strong>';
        return button;
    }

    async function loadCountries() {
        countryList.innerHTML = '<p class="muted">Loading countries...</p>';
        var response = await fetch('api/countries.php', { headers: { 'Accept': 'application/json' } });
        var data = await response.json();

        if (!data.success) {
            countryList.innerHTML = '<p class="error-text">Could not load countries.</p>';
            return;
        }

        countryList.innerHTML = '';
        var total = data.countries.reduce(function (sum, country) {
            return sum + Number(country.destination_count);
        }, 0);
        countryList.appendChild(countryButton('All countries', total, ''));

        data.countries.forEach(function (country) {
            countryList.appendChild(countryButton(country.country_name, country.destination_count, country.country_name));
        });
    }

    function destinationCard(destination) {
        return [
            '<article class="destination-card">',
            '  <div class="card-topline">',
            '    <span class="country-tag">' + escapeHtml(destination.country_name) + '</span>',
            '    <span class="cost-tag">' + Number(destination.estimated_cost_per_day).toFixed(2) + ' / day</span>',
            '  </div>',
            '  <h3>' + escapeHtml(destination.location_name) + '</h3>',
            '  <p>' + escapeHtml(destination.description).slice(0, 180) + (destination.description.length > 180 ? '...' : '') + '</p>',
            '  <p class="targets"><strong>Targets:</strong> ' + escapeHtml(destination.tourist_targets) + '</p>',
            '  <div class="card-actions">',
            '    <a href="details.php?id=' + Number(destination.id) + '">Details</a>',
            '    <a href="edit.php?id=' + Number(destination.id) + '">Edit</a>',
            '    <a class="danger-link" href="delete.php?id=' + Number(destination.id) + '">Delete</a>',
            '  </div>',
            '</article>'
        ].join('');
    }

    function renderDestinations(destinations) {
        if (!destinations.length) {
            destinationList.innerHTML = '<p class="empty-state">No destinations found for this country.</p>';
            return;
        }

        var html = '';
        var currentCountry = null;
        destinations.forEach(function (destination) {
            if (destination.country_name !== currentCountry) {
                currentCountry = destination.country_name;
                html += '<h3 class="country-group-title">' + escapeHtml(currentCountry) + '</h3>';
            }
            html += destinationCard(destination);
        });
        destinationList.innerHTML = html;
    }

    async function loadDestinations() {
        destinationList.innerHTML = '<p class="muted">Loading destinations...</p>';
        var params = new URLSearchParams({ page: state.page });
        if (state.country) {
            params.set('country', state.country);
        }

        var response = await fetch('api/destinations.php?' + params.toString(), { headers: { 'Accept': 'application/json' } });
        var data = await response.json();

        if (!data.success) {
            destinationList.innerHTML = '<p class="error-text">Could not load destinations.</p>';
            return;
        }

        state.page = data.pagination.page;
        state.totalPages = data.pagination.total_pages;
        heading.textContent = state.country || 'All countries';
        summary.textContent = data.pagination.total + ' destination(s), maximum 4 per page';
        pageStatus.textContent = 'Page ' + state.page + ' of ' + state.totalPages;
        previousButton.disabled = !data.pagination.has_previous;
        nextButton.disabled = !data.pagination.has_next;
        renderDestinations(data.destinations);
        await loadCountries();
    }

    countryList.addEventListener('click', function (event) {
        var button = event.target.closest('[data-country]');
        if (!button) {
            return;
        }
        state.country = button.dataset.country;
        state.page = 1;
        loadDestinations();
    });

    previousButton.addEventListener('click', function () {
        if (state.page > 1) {
            state.page -= 1;
            loadDestinations();
        }
    });

    nextButton.addEventListener('click', function () {
        if (state.page < state.totalPages) {
            state.page += 1;
            loadDestinations();
        }
    });

    loadCountries().then(loadDestinations).catch(function () {
        countryList.innerHTML = '<p class="error-text">Could not connect to the server.</p>';
        destinationList.innerHTML = '<p class="error-text">Could not connect to the server.</p>';
    });
}());