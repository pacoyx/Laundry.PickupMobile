import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-web-order-status-chip',
  standalone: true,
  imports: [MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-chip [class]="cssClass()" disableRipple>{{ status() }}</mat-chip>
  `,
  styles: `
    mat-chip {
      font-weight: 500;
      font-size: 12px;
      min-height: 28px;
    }
    .status-programado {
      --mdc-chip-elevated-container-color: #e3f2fd;
      --mdc-chip-label-text-color: #0d47a1;
    }
    .status-recogido {
      --mdc-chip-elevated-container-color: #e8f5e9;
      --mdc-chip-label-text-color: #1b5e20;
    }
    .status-default {
      --mdc-chip-elevated-container-color: #ede7f6;
      --mdc-chip-label-text-color: #4527a0;
    }
  `
})
export class WebOrderStatusChip {
  readonly status = input.required<string>();

  readonly cssClass = computed(() => {
    switch (this.status().toLowerCase()) {
      case 'programado':
        return 'status-programado';
      case 'recogido':
        return 'status-recogido';
      default:
        return 'status-default';
    }
  });
}
