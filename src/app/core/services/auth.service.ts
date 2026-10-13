import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  JwtClaims,
  LoginRequest,
  LoginResponse,
  PICKUP_MOBILE_PERMISSION,
  RefreshTokenResponse,
  UserProfile
} from '../models/auth.models';
import { decodeJwtPayload, toArray } from '../utils/jwt.util';
import { SessionStorageService } from './session-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(SessionStorageService);
  private readonly router = inject(Router);

  private readonly profileSignal = signal<UserProfile | null>(this.storage.getProfile());

  readonly profile = this.profileSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.profileSignal());
  readonly hasMobileAccess = computed(() => !!this.profileSignal()?.permissions?.includes(PICKUP_MOBILE_PERMISSION));

  login(request: LoginRequest): Observable<UserProfile> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, request).pipe(
      tap((response) => this.storage.setTokens(response.token, response.refreshToken)),
      map((response) => this.buildProfile(response)),
      tap((profile) => {
        this.storage.setProfile(profile);
        this.profileSignal.set(profile);
      })
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const token = this.storage.getAccessToken();
    const refreshToken = this.storage.getRefreshToken();
    return this.http
      .post<RefreshTokenResponse>(`${environment.apiUrl}/refresh-token`, { token, refreshToken })
      .pipe(tap((response) => this.storage.setTokens(response.token, response.refreshToken)));
  }

  private buildProfile(response: LoginResponse): UserProfile {
    const claims = decodeJwtPayload<JwtClaims>(response.token);
    const employeeId = claims?.employeeId ? Number(claims.employeeId) : null;

    return {
      userId: response.userId,
      username: response.userName,
      fullName: response.name,
      role: response.role,
      roles: toArray(response.roles),
      permissions: toArray(response.permissions),
      employeeId,
      branchSales: response.branchSales ?? []
    };
  }

  hasPermission(permission: string): boolean {
    return !!this.profileSignal()?.permissions?.includes(permission);
  }

  logout(): void {
    this.storage.clear();
    this.profileSignal.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return this.storage.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.storage.getRefreshToken();
  }
}
