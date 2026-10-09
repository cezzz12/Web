export interface Destination {
  id: number;
  location_name: string;
  country_name: string;
  description: string;
  tourist_targets: string;
  estimated_cost_per_day: string;
}

export interface DestinationForm {
  location_name: string;
  country_name: string;
  description: string;
  tourist_targets: string;
  estimated_cost_per_day: string;
}

export interface CountrySummary {
  country_name: string;
  destination_count: number;
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_previous: boolean;
  has_next: boolean;
}

export interface DestinationsResponse {
  success: boolean;
  destinations: Destination[];
  pagination: Pagination;
  country: string;
  message?: string;
}

export interface CountriesResponse {
  success: boolean;
  countries: CountrySummary[];
  message?: string;
}

export interface SaveResponse {
  success: boolean;
  message: string;
  destination?: Destination;
  errors?: Partial<Record<keyof DestinationForm, string>>;
}

export interface SessionResponse {
  success: boolean;
  authenticated: boolean;
  username?: string;
  message?: string;
}
