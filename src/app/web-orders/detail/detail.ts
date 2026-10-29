import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { WebOrderStatusChip } from '../../shared/components/web-order-status-chip/web-order-status-chip';
import { WebOrderPhotoUpload } from '../../shared/components/web-order-photo-upload/web-order-photo-upload';

@Component({
  selector: 'app-web-order-detail',
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
    WebOrderStatusChip,
    WebOrderPhotoUpload
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class WebOrderDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly webOrdersService = inject(WebOrdersService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly order = signal<WebOrderListItem | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly completing = signal(false);

  readonly isProgramado = computed(() => this.order()?.status === 'Programado');

  readonly completeForm = this.fb.nonNullable.group({
    observation: ['']
  });

  private get serie(): string {
    return this.route.snapshot.paramMap.get('serie') ?? '';
  }

  private get numero(): string {
    return this.route.snapshot.paramMap.get('numero') ?? '';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.webOrdersService.getByDocument(this.serie, this.numero).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  complete(): void {
    const order = this.order();
    if (!order || this.completing()) {
      return;
    }
    this.completing.set(true);
    const observation = this.completeForm.getRawValue().observation.trim();
    this.webOrdersService.complete(order.id, { observation: observation || null }).subscribe({
      next: () => {
        this.completing.set(false);
        this.notification.success('Pedido marcado como recogido.');
        this.load();
      },
      error: (error) => {
        this.completing.set(false);
        this.notification.error(getErrorMessage(error, 'No se pudo marcar el pedido como recogido.'));
      }
    });
  }

  back(): void {
    this.router.navigate(['/web-orders']);
  }
}
