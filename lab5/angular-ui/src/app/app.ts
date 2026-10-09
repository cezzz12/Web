import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DestinationsApi } from './destinations-api';
import {
  CountrySummary,
  Destination,
  DestinationForm,
  Pagination,
} from './destination.model';
import { getBackendBaseUrl } from './runtime-config';

const emptyForm: DestinationForm = {
  location_name: '',
  country_name: '',
  description: '',
  tourist_targets: '',
  estimated_cost_per_day: '',
};

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  countries: CountrySummary[] = [];
  destinations: Destination[] = [];
  selectedCountry = '';
  form: DestinationForm = { ...emptyForm };
  editingId: number | null = null;
  loading = false;
  saving = false;
  initializing = true;
  authEnabled = false;
  username = '';
  message = '';
  error = '';
  fieldErrors: Partial<Record<keyof DestinationForm, string>> = {};
  pagination: Pagination = {
    page: 1,
    per_page: 4,
    total: 0,
    total_pages: 1,
    has_previous: false,
    has_next: false,
  };

  constructor(private readonly api: DestinationsApi) {}

  ngOnInit(): void {
    this.initializeApplication();
  }

  get isEditing(): boolean {
    return this.editingId !== null;
  }

  get totalCountries(): number {
    return this.countries.length;
  }

  get backendBaseUrl(): string {
    return getBackendBaseUrl();
  }

  loadCountries(): void {
    this.api.getCountries().subscribe({
      next: (response) => {
        this.countries = response.countries ?? [];
      },
      error: (error: HttpErrorResponse) => {
        if (this.redirectToLoginIfUnauthorized(error)) {
          return;
        }

        this.error = 'Could not load countries.';
      },
    });
  }

  loadDestinations(page = this.pagination.page): void {
    this.loading = true;
    this.error = '';

    this.api.getDestinations(this.selectedCountry, page).subscribe({
      next: (response) => {
        this.destinations = response.destinations ?? [];
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        if (this.redirectToLoginIfUnauthorized(error)) {
          this.loading = false;
          return;
        }

        this.error = 'Could not load destinations.';
        this.loading = false;
      },
    });
  }

  logout(): void {
    if (!this.authEnabled) {
      return;
    }

    this.api.logout().subscribe({
      next: () => {
        window.location.href = `${this.backendBaseUrl}/login`;
      },
      error: () => {
        window.location.href = `${this.backendBaseUrl}/login`;
      },
    });
  }

  selectCountry(country: string): void {
    this.selectedCountry = country;
    this.loadDestinations(1);
  }

  previousPage(): void {
    if (this.pagination.has_previous) {
      this.loadDestinations(this.pagination.page - 1);
    }
  }

  nextPage(): void {
    if (this.pagination.has_next) {
      this.loadDestinations(this.pagination.page + 1);
    }
  }

  startEdit(destination: Destination): void {
    this.editingId = destination.id;
    this.form = {
      location_name: destination.location_name,
      country_name: destination.country_name,
      description: destination.description,
      tourist_targets: destination.tourist_targets,
      estimated_cost_per_day: destination.estimated_cost_per_day,
    };
    this.message = '';
    this.error = '';
    this.fieldErrors = {};
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    if (this.isEditing && !confirm('Cancel editing this destination?')) {
      return;
    }

    this.resetForm();
  }

  saveDestination(): void {
    this.message = '';
    this.error = '';
    this.fieldErrors = this.validateForm();

    if (Object.keys(this.fieldErrors).length > 0) {
      this.error = 'Please fix the highlighted fields.';
      return;
    }

    this.saving = true;
    const request = this.isEditing && this.editingId
      ? this.api.updateDestination(this.editingId, this.form)
      : this.api.createDestination(this.form);

    request.subscribe({
      next: (response) => {
        this.message = response.message || 'Saved.';
        this.saving = false;
        this.resetForm();
        this.loadCountries();
        this.loadDestinations(this.pagination.page);
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;

        if (this.redirectToLoginIfUnauthorized(error)) {
          return;
        }

        this.error = error.error?.message || 'Could not save destination.';
        this.fieldErrors = error.error?.errors || {};
      },
    });
  }

  deleteDestination(destination: Destination): void {
    if (!confirm(`Delete ${destination.location_name}?`)) {
      return;
    }

    this.api.deleteDestination(destination.id).subscribe({
      next: (response) => {
        this.message = response.message || 'Deleted.';
        this.loadCountries();
        this.loadDestinations(this.pagination.page);

        if (this.editingId === destination.id) {
          this.resetForm();
        }
      },
      error: (error: HttpErrorResponse) => {
        if (this.redirectToLoginIfUnauthorized(error)) {
          return;
        }

        this.error = 'Could not delete destination.';
      },
    });
  }

  resetForm(): void {
    this.form = { ...emptyForm };
    this.editingId = null;
    this.fieldErrors = {};
  }

  private initializeApplication(): void {
    this.finishInitialization();

    this.api.getSession().subscribe({
      next: (response) => {
        this.authEnabled = response.authenticated;
        this.username = response.username ?? '';
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          return;
        }

        if (error.status === 401) {
          const returnUrl = encodeURIComponent(window.location.href);
          window.location.href = `${this.backendBaseUrl}/login?returnUrl=${returnUrl}`;
          return;
        }

        this.error = 'Could not reach the configured backend.';
      },
    });
  }

  private finishInitialization(): void {
    if (!this.initializing) {
      return;
    }

    this.initializing = false;
    this.loadCountries();
    this.loadDestinations();
  }

  private redirectToLoginIfUnauthorized(error: HttpErrorResponse): boolean {
    if (error.status !== 401) {
      return false;
    }

    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${this.backendBaseUrl}/login?returnUrl=${returnUrl}`;
    return true;
  }

  private validateForm(): Partial<Record<keyof DestinationForm, string>> {
    const errors: Partial<Record<keyof DestinationForm, string>> = {};
    const cost = Number(this.form.estimated_cost_per_day);

    if (this.form.location_name.trim().length < 2) {
      errors.location_name = 'Enter at least 2 characters.';
    }

    if (this.form.country_name.trim().length < 2) {
      errors.country_name = 'Enter at least 2 characters.';
    }

    if (this.form.description.trim().length < 10) {
      errors.description = 'Enter at least 10 characters.';
    }

    if (this.form.tourist_targets.trim().length < 3) {
      errors.tourist_targets = 'Add at least one target.';
    }

    if (!Number.isFinite(cost) || cost <= 0) {
      errors.estimated_cost_per_day = 'Enter a positive number.';
    }

    return errors;
  }
}
