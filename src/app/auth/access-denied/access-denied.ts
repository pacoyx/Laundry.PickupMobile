import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrapper">
      <mat-icon>block</mat-icon>
      <h2>Acceso denegado</h2>
      <p>Su usuario no tiene permiso para usar la aplicación de recojo móvil.</p>
      <p class="hint">Contacte al administrador para habilitar el permiso "pickup_mobile.access".</p>
      <button mat-flat-button color="primary" (click)="logout()">Cerrar sesión</button>
    </div>
  `,
  styles: `
    .wrapper {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 32px;
    }
    mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mat-sys-error, #b3261e);
      margin-bottom: 12px;
    }
    p {
      margin: 4px 0;
      color: var(--mat-sys-on-surface-variant, #5f6368);
    }
    .hint {
      font-size: 13px;
      margin-bottom: 20px;
    }
    button {
      min-height: 48px;
      padding: 0 32px;
    }
  `
})
export class AccessDenied {
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
