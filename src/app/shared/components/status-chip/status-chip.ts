import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { PICKUP_GUIDE_STATUS_LABELS, PickupGuideStatus } from '../../../core/models/pickup-mobile.models';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-chip [class]="'status-' + status()" disableRipple>{{ label() }}</mat-chip>
  `,
  styles: `
    mat-chip {
      font-weight: 500;
      font-size: 12px;
      min-height: 28px;
    }
    .status-1 {
      --mdc-chip-elevated-container-color: #fff4e5;
      --mdc-chip-label-text-color: #8a5300;
    }
    .status-2 {
      --mdc-chip-elevated-container-color: #e3f2fd;
      --mdc-chip-label-text-color: #0d47a1;
    }
    .status-3 {
      --mdc-chip-elevated-container-color: #ede7f6;
      --mdc-chip-label-text-color: #4527a0;
    }
    .status-4 {
      --mdc-chip-elevated-container-color: #e8f5e9;
      --mdc-chip-label-text-color: #1b5e20;
    }
    .status-5 {
      --mdc-chip-elevated-container-color: #fdecea;
      --mdc-chip-label-text-color: #b71c1c;
    }
  `
})
export class StatusChip {
  readonly status = input.required<PickupGuideStatus>();
  readonly label = computed(() => PICKUP_GUIDE_STATUS_LABELS[this.status()] ?? 'Desconocido');
}
