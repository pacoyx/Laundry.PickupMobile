import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AttachmentsService } from '../../../core/services/attachments.service';
import { NotificationService } from '../../../core/services/notification.service';
import { getErrorMessage } from '../../../core/utils/error.util';
import { PickupGuideAttachmentResponse, PickupGuideAttachmentType } from '../../../core/models/pickup-mobile.models';

interface PhotoItem {
  attachment: PickupGuideAttachmentResponse;
  previewUrl: string;
}

@Component({
  selector: 'app-photo-capture',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="actions">
      <button mat-stroked-button type="button" [disabled]="!editable()" (click)="cameraInput.click()">
        <mat-icon>{{ icon() }}</mat-icon>
        Tomar foto
      </button>
      <button mat-stroked-button type="button" [disabled]="!editable()" (click)="galleryInput.click()">
        <mat-icon>image</mat-icon>
        Seleccionar foto
      </button>
    </div>

    <input #cameraInput type="file" accept="image/*" capture="environment" hidden (change)="onFileSelected($event)" />
    <input #galleryInput type="file" accept="image/*" hidden (change)="onFileSelected($event)" />

    @if (uploading()) {
      <mat-progress-bar mode="indeterminate" />
    }

    @if (photos().length === 0 && !uploading()) {
      <p class="empty">{{ emptyLabel() }}</p>
    } @else {
      <div class="grid">
        @for (photo of photos(); track photo.attachment.id) {
          <div class="photo-card">
            <img [src]="photo.previewUrl" alt="Evidencia fotográfica" />
            @if (editable()) {
              <button mat-icon-button class="delete-btn" type="button" (click)="remove(photo)">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </div>
        }
      </div>
    }
  `,
  styles: `
    .actions {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }
    .actions button {
      flex: 1;
      min-height: 48px;
    }
    .empty {
      color: var(--mat-sys-on-surface-variant);
      font-size: 14px;
      text-align: center;
      padding: 16px 0;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
      gap: 10px;
    }
    .photo-card {
      position: relative;
      aspect-ratio: 1;
      border-radius: 10px;
      overflow: hidden;
      background: #eee;
    }
    .photo-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .delete-btn {
      position: absolute;
      top: 2px;
      right: 2px;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      width: 32px;
      height: 32px;
      line-height: 32px;
    }
  `
})
export class PhotoCapture {
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly notification = inject(NotificationService);

  readonly guideId = input.required<number>();
  readonly editable = input(true);
  readonly initialAttachments = input<PickupGuideAttachmentResponse[]>([]);
  readonly attachmentType = input(PickupGuideAttachmentType.Photo);
  readonly emptyLabel = input('Sin fotos registradas.');
  readonly icon = input('photo_camera');
  readonly photos = signal<PhotoItem[]>([]);
  readonly uploading = signal(false);

  constructor() {
    effect(() => {
      const photoItems = this.initialAttachments()
        .filter((a) => a.attachmentType === this.attachmentType())
        .map((attachment) => ({ attachment, previewUrl: '' }));
      this.photos.set(photoItems);
      photoItems.forEach((item) => this.loadPreview(item));
    });
  }

  private loadPreview(item: PhotoItem): void {
    this.attachmentsService.download(item.attachment.id).subscribe({
      next: (blob) => {
        item.previewUrl = URL.createObjectURL(blob);
        this.photos.set([...this.photos()]);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.attachmentsService.upload(this.guideId(), file, this.attachmentType()).subscribe({
      next: (httpEvent) => {
        if (httpEvent.type === HttpEventType.Response && httpEvent.body) {
          const attachment = httpEvent.body;
          const previewUrl = URL.createObjectURL(file);
          this.photos.set([...this.photos(), { attachment, previewUrl }]);
          this.uploading.set(false);
        }
      },
      error: (error) => {
        this.uploading.set(false);
        this.notification.error(getErrorMessage(error, 'No se pudo subir la fotografía.'));
      }
    });
  }

  remove(photo: PhotoItem): void {
    this.attachmentsService.delete(photo.attachment.id).subscribe({
      next: () => {
        this.photos.set(this.photos().filter((p) => p.attachment.id !== photo.attachment.id));
        this.notification.success('Foto eliminada.');
      },
      error: (error) => this.notification.error(getErrorMessage(error, 'No se pudo eliminar la foto.'))
    });
  }
}
