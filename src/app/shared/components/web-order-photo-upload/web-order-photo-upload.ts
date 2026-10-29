import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WebOrderPhotosService } from '../../../core/services/web-order-photos.service';
import { NotificationService } from '../../../core/services/notification.service';
import { getErrorMessage } from '../../../core/utils/error.util';

interface UploadedPhoto {
  id: number;
  previewUrl: string;
}

@Component({
  selector: 'app-web-order-photo-upload',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="actions">
      <button mat-stroked-button type="button" [disabled]="!editable()" (click)="cameraInput.click()">
        <mat-icon>photo_camera</mat-icon>
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
      <p class="empty">Sin fotos de evidencia subidas.</p>
    } @else {
      <div class="grid">
        @for (photo of photos(); track photo.id) {
          <div class="photo-card">
            <img [src]="photo.previewUrl" alt="Evidencia de recojo" />
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
  `
})
export class WebOrderPhotoUpload {
  private readonly photosService = inject(WebOrderPhotosService);
  private readonly notification = inject(NotificationService);

  readonly webOrderId = input.required<number>();
  readonly editable = input(true);
  readonly photos = signal<UploadedPhoto[]>([]);
  readonly uploading = signal(false);
  readonly uploaded = output<void>();

  onFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.photosService.upload(this.webOrderId(), file).subscribe({
      next: (httpEvent) => {
        if (httpEvent.type === HttpEventType.Response && httpEvent.body) {
          const photo = httpEvent.body;
          this.photos.set([...this.photos(), { id: photo.id, previewUrl: URL.createObjectURL(file) }]);
          this.uploading.set(false);
          this.uploaded.emit();
        }
      },
      error: (error) => {
        this.uploading.set(false);
        this.notification.error(getErrorMessage(error, 'No se pudo subir la fotografía.'));
      }
    });
  }
}
