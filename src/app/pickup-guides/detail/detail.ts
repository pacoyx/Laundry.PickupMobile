import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { PickupGuidesService } from '../../core/services/pickup-guides.service';
import { AttachmentsService } from '../../core/services/attachments.service';
import { NotificationService } from '../../core/services/notification.service';
import { getErrorMessage } from '../../core/utils/error.util';
import { downloadBlob } from '../../core/utils/file.util';
import { PickupGuideAttachmentType, PickupGuideDetail, PickupGuideStatus } from '../../core/models/pickup-mobile.models';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import { PhotoCapture } from '../../shared/components/photo-capture/photo-capture';

@Component({
  selector: 'app-pickup-guide-detail',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    ErrorState,
    StatusChip,
    PhotoCapture
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class PickupGuideDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pickupGuidesService = inject(PickupGuidesService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly notification = inject(NotificationService);

  readonly PickupGuideStatus = PickupGuideStatus;
  readonly physicalGuidePhotoType = PickupGuideAttachmentType.PhysicalGuidePhoto;
  readonly detailColumns = ['service', 'quantity', 'weight', 'total'];

  readonly guide = signal<PickupGuideDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly signatureUrl = signal<string | null>(null);

  readonly isDraft = computed(() => this.guide()?.status === PickupGuideStatus.Draft);

  private get guideId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.pickupGuidesService.getById(this.guideId).subscribe({
      next: (guide) => {
        this.guide.set(guide);
        this.loading.set(false);
        this.loadSignature(guide);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  private loadSignature(guide: PickupGuideDetail): void {
    const signature = guide.attachments.find((a) => a.attachmentType === PickupGuideAttachmentType.Signature);
    if (!signature) {
      return;
    }
    this.attachmentsService.download(signature.id).subscribe({
      next: (blob) => this.signatureUrl.set(URL.createObjectURL(blob))
    });
  }

  downloadSignature(): void {
    const signature = this.guide()?.attachments.find((a) => a.attachmentType === PickupGuideAttachmentType.Signature);
    if (!signature) {
      return;
    }
    this.attachmentsService.download(signature.id).subscribe({
      next: (blob) => downloadBlob(blob, signature.originalFileName)
    });
  }

  deleteSignature(): void {
    const signature = this.guide()?.attachments.find((a) => a.attachmentType === PickupGuideAttachmentType.Signature);
    if (!signature) {
      return;
    }
    this.attachmentsService.delete(signature.id).subscribe({
      next: () => {
        this.signatureUrl.set(null);
        this.notification.success('Firma eliminada.');
        this.load();
      },
      error: (error) => this.notification.error(getErrorMessage(error, 'No se pudo eliminar la firma.'))
    });
  }

  edit(): void {
    this.router.navigate(['/pickup-guides', this.guideId, 'edit']);
  }
}
