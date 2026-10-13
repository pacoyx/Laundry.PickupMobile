import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

const PUBLIC_ENDPOINTS = ['/login', '/refresh-token'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) => req.url.endsWith(endpoint));
  const token = authService.getAccessToken();

  const authReq = isApiRequest && token && !isPublicEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isApiRequest && !isPublicEndpoint && authService.getRefreshToken()) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${authService.getAccessToken()}` }
            });
            return next(retried);
          }),
          catchError((refreshError) => {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
