import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSummary, PickupGuideListItem } from '../models/pickup-mobile.models';

interface DashboardApiResponse {
  todayPickupGuides: number;
  draftPickupGuides: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getSummary(): Observable<DashboardSummary> {
    return forkJoin({
      dashboard: this.http.get<DashboardApiResponse>(`${environment.apiUrl}/pickup-mobile/dashboard`),
      guides: this.http.get<PickupGuideListItem[]>(`${environment.apiUrl}/pickup-mobile/my-pickup-guides`)
    }).pipe(
      map(({ dashboard, guides }) => ({
        todayPickupGuides: dashboard.todayPickupGuides,
        draftPickupGuides: dashboard.draftPickupGuides,
        totalPickupGuides: guides.length
      }))
    );
  }
}
