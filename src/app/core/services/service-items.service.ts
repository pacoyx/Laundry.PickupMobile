import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServiceItemLookup } from '../models/pickup-mobile.models';

@Injectable({ providedIn: 'root' })
export class ServiceItemsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pickup-mobile/customers`;

  getByCustomer(customerId: number): Observable<ServiceItemLookup[]> {
    return this.http.get<ServiceItemLookup[]>(`${this.baseUrl}/${customerId}/service-items`);
  }
}
