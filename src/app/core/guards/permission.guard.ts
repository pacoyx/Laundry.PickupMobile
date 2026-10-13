import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PICKUP_MOBILE_PERMISSION } from '../models/auth.models';
import { AuthService } from '../services/auth.service';

export const pickupMobileAccessGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.hasPermission(PICKUP_MOBILE_PERMISSION)) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};
