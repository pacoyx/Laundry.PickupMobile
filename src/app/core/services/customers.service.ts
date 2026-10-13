import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerLookup } from '../models/pickup-mobile.models';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pickup-mobile/customers`;

  search(term: string): Observable<CustomerLookup[]> {
    const params = term ? new HttpParams().set('search', term) : undefined;
    return this.http.get<CustomerLookup[]>(this.baseUrl, { params });
  }
}
