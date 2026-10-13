import { Injectable } from '@angular/core';
import { UserProfile } from '../models/auth.models';

const ACCESS_TOKEN_KEY = 'pickup_mobile_access_token';
const REFRESH_TOKEN_KEY = 'pickup_mobile_refresh_token';
const PROFILE_KEY = 'pickup_mobile_profile';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setProfile(profile: UserProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  getProfile(): UserProfile | null {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }
}
