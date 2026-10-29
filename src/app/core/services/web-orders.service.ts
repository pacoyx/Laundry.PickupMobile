import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompleteWebOrderRequest, WebOrderListItem } from '../models/web-order.models';

@Injectable({ providedIn: 'root' })
export class WebOrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pickup-mobile`;

  getMyOrders(status?: string): Observable<WebOrderListItem[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<WebOrderListItem[]>(`${this.baseUrl}/my-web-orders`, { params });
  }

  getByDocument(serie: string, numero: string): Observable<WebOrderListItem> {
    return this.http.get<WebOrderListItem>(`${this.baseUrl}/web-orders/document/${serie}/${numero}`);
  }

  complete(webOrderId: number, request: CompleteWebOrderRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/my-web-orders/${webOrderId}/complete`, request);
  }
}
