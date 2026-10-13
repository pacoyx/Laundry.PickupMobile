import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { pickupMobileAccessGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login)
  },
  {
    path: 'access-denied',
    canActivate: [authGuard],
    loadComponent: () => import('./auth/access-denied/access-denied').then((m) => m.AccessDenied)
  },
  {
    path: '',
    canActivate: [authGuard, pickupMobileAccessGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard)
      },
      {
        path: 'pickup-guides',
        loadComponent: () => import('./pickup-guides/list/list').then((m) => m.PickupGuidesList)
      },
      {
        path: 'pickup-guides/new',
        loadComponent: () => import('./pickup-guides/new/new').then((m) => m.PickupGuideNew)
      },
      {
        path: 'pickup-guides/:id',
        loadComponent: () => import('./pickup-guides/detail/detail').then((m) => m.PickupGuideDetailPage)
      },
      {
        path: 'pickup-guides/:id/edit',
        loadComponent: () => import('./pickup-guides/new/new').then((m) => m.PickupGuideNew)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile').then((m) => m.Profile)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
