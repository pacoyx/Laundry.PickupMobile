import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PickupGuideAttachmentResponse, PickupGuideAttachmentType } from '../models/pickup-mobile.models';

@Injectable({ providedIn: 'root' })
export class AttachmentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pickup-mobile`;

  getByGuide(guideId: number): Observable<PickupGuideAttachmentResponse[]> {
    return this.http.get<PickupGuideAttachmentResponse[]>(`${this.baseUrl}/pickup-guides/${guideId}/attachments`);
  }

  upload(guideId: number, file: File, type: PickupGuideAttachmentType): Observable<HttpEvent<PickupGuideAttachmentResponse>> {
    const formData = new FormData();
    formData.append('attachmentType', PickupGuideAttachmentType[type]);
    formData.append('file', file);

    const request = new HttpRequest('POST', `${this.baseUrl}/pickup-guides/${guideId}/attachments`, formData, {
      reportProgress: true
    });
    return this.http.request<PickupGuideAttachmentResponse>(request);
  }

  delete(attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/attachments/${attachmentId}`);
  }

  download(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/attachments/${attachmentId}/download`, { responseType: 'blob' });
  }
}
