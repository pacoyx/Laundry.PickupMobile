import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LoadingOverlay } from '../../shared/components/loading-overlay/loading-overlay';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatToolbarModule, LoadingOverlay],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <span class="brand">Pickup Mobile</span>
      <span class="spacer"></span>
      <span class="user">{{ auth.profile()?.fullName }}</span>
    </mat-toolbar>

    <main class="content">
      <router-outlet />
    </main>

    <app-loading-overlay />

    <nav class="bottom-nav">
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
        <mat-icon>dashboard</mat-icon>
        <span>Dashboard</span>
      </a>
      <a routerLink="/pickup-guides/new" routerLinkActive="active" class="nav-item">
        <mat-icon>add_circle</mat-icon>
        <span>Nueva Guía</span>
      </a>
      <a routerLink="/pickup-guides" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">
        <mat-icon>assignment</mat-icon>
        <span>Mis Guías</span>
      </a>
      <a routerLink="/web-orders" routerLinkActive="active" class="nav-item">
        <mat-icon>local_shipping</mat-icon>
        <span>Pedidos Web</span>
      </a>
      <a routerLink="/profile" routerLinkActive="active" class="nav-item">
        <mat-icon>account_circle</mat-icon>
        <span>Perfil</span>
      </a>
    </nav>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .toolbar {
      flex: 0 0 auto;
    }
    .brand {
      font-weight: 600;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .user {
      font-size: 13px;
      opacity: 0.9;
    }
    .content {
      flex: 1 1 auto;
      overflow-y: auto;
      padding-bottom: 72px;
    }
    .bottom-nav {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      background: var(--mat-sys-surface-container, #fff);
      border-top: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
      z-index: 10;
    }
    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 10px 4px;
      min-height: 64px;
      text-decoration: none;
      color: var(--mat-sys-on-surface-variant, #5f6368);
      font-size: 11px;
    }
    .nav-item.active {
      color: var(--mat-sys-primary, #006494);
      font-weight: 600;
    }
    @media (min-width: 900px) and (orientation: landscape) {
      .bottom-nav {
        top: 0;
        bottom: 0;
        right: auto;
        width: 96px;
        flex-direction: column;
        border-top: none;
        border-right: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
      }
      .content {
        margin-left: 96px;
        padding-bottom: 0;
      }
    }
  `
})
export class MainLayout {
  readonly auth = inject(AuthService);
}
