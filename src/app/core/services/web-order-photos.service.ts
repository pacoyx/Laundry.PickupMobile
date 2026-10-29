import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WebOrderPhoto } from '../models/web-order.models';

@Injectable({ providedIn: 'root' })
export class WebOrderPhotosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pickup-mobile`;

  upload(webOrderId: number, file: File): Observable<HttpEvent<WebOrderPhoto>> {
    const formData = new FormData();
    formData.append('file', file);

    const request = new HttpRequest('POST', `${this.baseUrl}/web-orders/${webOrderId}/photos`, formData, {
      reportProgress: true
    });
    return this.http.request<WebOrderPhoto>(request);
  }
}
