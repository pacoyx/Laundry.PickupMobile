import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-state">
      <mat-icon>error_outline</mat-icon>
      <p class="title">{{ message() }}</p>
      <button mat-flat-button color="primary" (click)="retry.emit()">Reintentar</button>
    </div>
  `,
  styles: `
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      gap: 12px;
    }
    mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--mat-sys-error);
    }
    .title {
      font-size: 15px;
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
    }
    button {
      min-height: 44px;
      padding: 0 24px;
    }
  `
})
export class ErrorState {
  readonly message = input('No se pudo cargar la información.');
  readonly retry = output<void>();
}
