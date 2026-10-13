import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon() }}</mat-icon>
      <p class="title">{{ title() }}</p>
      @if (subtitle()) {
        <p class="subtitle">{{ subtitle() }}</p>
      }
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      color: var(--mat-sys-on-surface-variant);
    }
    mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      margin-bottom: 12px;
      opacity: 0.6;
    }
    .title {
      font-size: 17px;
      font-weight: 500;
      margin: 0;
    }
    .subtitle {
      font-size: 14px;
      margin: 4px 0 0;
    }
  `
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly title = input('Sin información');
  readonly subtitle = input<string | null>(null);
}
