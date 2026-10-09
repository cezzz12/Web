import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CountriesResponse,
  DestinationForm,
  DestinationsResponse,
  SessionResponse,
  SaveResponse,
} from './destination.model';
import { buildBackendUrl } from './runtime-config';

@Injectable({
  providedIn: 'root',
})
export class DestinationsApi {
  private readonly countriesUrl = buildBackendUrl('/api/countries.php');
  private readonly destinationsUrl = buildBackendUrl('/api/destinations.php');
  private readonly sessionUrl = buildBackendUrl('/api/session.php');
  private readonly logoutUrl = buildBackendUrl('/api/logout.php');
  private readonly credentialedRequest = { withCredentials: true as const };

  constructor(private readonly http: HttpClient) {}

  getCountries(): Observable<CountriesResponse> {
    return this.http.get<CountriesResponse>(this.countriesUrl, this.credentialedRequest);
  }

  getSession(): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(this.sessionUrl, this.credentialedRequest);
  }

  getDestinations(country: string, page: number): Observable<DestinationsResponse> {
    let params = new HttpParams().set('page', page);

    if (country) {
      params = params.set('country', country);
    }

    return this.http.get<DestinationsResponse>(this.destinationsUrl, {
      ...this.credentialedRequest,
      params,
    });
  }

  createDestination(destination: DestinationForm): Observable<SaveResponse> {
    return this.http.post<SaveResponse>(this.destinationsUrl, destination, this.credentialedRequest);
  }

  updateDestination(id: number, destination: DestinationForm): Observable<SaveResponse> {
    const params = new HttpParams().set('id', id);
    return this.http.put<SaveResponse>(this.destinationsUrl, destination, {
      ...this.credentialedRequest,
      params,
    });
  }

  deleteDestination(id: number): Observable<SaveResponse> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<SaveResponse>(this.destinationsUrl, {
      ...this.credentialedRequest,
      params,
    });
  }

  logout(): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(this.logoutUrl, {}, this.credentialedRequest);
  }
}
