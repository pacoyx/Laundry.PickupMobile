import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickupGuidesService } from '../../core/services/pickup-guides.service';
import { PickupGuideListItem, PickupGuideStatus } from '../../core/models/pickup-mobile.models';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { StatusChip } from '../../shared/components/status-chip/status-chip';

@Component({
  selector: 'app-pickup-guides-list',
  standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, ErrorState, EmptyState, StatusChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class PickupGuidesList implements OnInit {
  private readonly pickupGuidesService = inject(PickupGuidesService);
  private readonly router = inject(Router);

  readonly PickupGuideStatus = PickupGuideStatus;
  readonly guides = signal<PickupGuideListItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.pickupGuidesService.getMyGuides().subscribe({
      next: (guides) => {
        this.guides.set(guides);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  view(id: number): void {
    this.router.navigate(['/pickup-guides', id]);
  }

  edit(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/pickup-guides', id, 'edit']);
  }
}
