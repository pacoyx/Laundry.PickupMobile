import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmployeeLookup } from '../models/pickup-mobile.models';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pickup-mobile/employees`;

  getAll(): Observable<EmployeeLookup[]> {
    return this.http.get<EmployeeLookup[]>(this.baseUrl);
  }
}
