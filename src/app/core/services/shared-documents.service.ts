import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SharedDocument } from '../models/shared-document.models';

@Injectable({ providedIn: 'root' })
export class SharedDocumentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/shared-documents`;

  getMyDocuments(): Observable<SharedDocument[]> {
    return this.http.get<SharedDocument[]>(`${this.baseUrl}/my`);
  }

  download(documentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${documentId}/file`, { responseType: 'blob' });
  }
}
