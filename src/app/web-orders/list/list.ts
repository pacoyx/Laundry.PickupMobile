import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WebOrdersService } from '../../core/services/web-orders.service';
import { NotificationService } from '../../core/services/notification.service';
import { getErrorMessage } from '../../core/utils/error.util';
import { WebOrderListItem } from '../../core/models/web-order.models';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { WebOrderStatusChip } from '../../shared/components/web-order-status-chip/web-order-status-chip';

@Component({
  selector: 'app-web-orders-list',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ErrorState,
    EmptyState,
    WebOrderStatusChip
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class WebOrdersList implements OnInit {
  private readonly webOrdersService = inject(WebOrdersService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly orders = signal<WebOrderListItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly searching = signal(false);

  readonly searchForm = this.fb.nonNullable.group({
    serie: ['', Validators.required],
    numero: ['', Validators.required]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.webOrdersService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  search(): void {
    if (this.searchForm.invalid || this.searching()) {
      return;
    }
    const { serie, numero } = this.searchForm.getRawValue();
    this.searching.set(true);
    this.webOrdersService.getByDocument(serie.trim(), numero.trim()).subscribe({
      next: (order) => {
        this.searching.set(false);
        this.view(order);
      },
      error: (error) => {
        this.searching.set(false);
        this.notification.error(getErrorMessage(error, 'No se encontró un pedido con ese número de guía asignado a ti.'));
      }
    });
  }

  view(order: WebOrderListItem): void {
    this.router.navigate(['/web-orders', order.workGuideSerie, order.workGuideNumero]);
  }
}
