import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePickupGuideRequest,
  PickupGuideDetail,
  PickupGuideListItem,
  PickupGuideStatus,
  UpdatePickupGuideRequest
} from '../models/pickup-mobile.models';

@Injectable({ providedIn: 'root' })
export class PickupGuidesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pickup-mobile`;

  getMyGuides(status?: PickupGuideStatus): Observable<PickupGuideListItem[]> {
    const params = status != null ? new HttpParams().set('status', status) : undefined;
    return this.http.get<PickupGuideListItem[]>(`${this.baseUrl}/my-pickup-guides`, { params });
  }

  getById(id: number): Observable<PickupGuideDetail> {
    return this.http.get<PickupGuideDetail>(`${this.baseUrl}/pickup-guides/${id}`);
  }

  create(request: CreatePickupGuideRequest): Observable<PickupGuideDetail> {
    return this.http.post<PickupGuideDetail>(`${this.baseUrl}/pickup-guides`, request);
  }

  update(id: number, request: UpdatePickupGuideRequest): Observable<PickupGuideDetail> {
    return this.http.put<PickupGuideDetail>(`${this.baseUrl}/pickup-guides/${id}`, request);
  }
}
