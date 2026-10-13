import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VehicleLookup } from '../models/pickup-mobile.models';

@Injectable({ providedIn: 'root' })
export class VehiclesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pickup-mobile/vehicles`;

  getAll(): Observable<VehicleLookup[]> {
    return this.http.get<VehicleLookup[]>(this.baseUrl);
  }
}
