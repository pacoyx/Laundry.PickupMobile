import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedDocumentsService } from '../../core/services/shared-documents.service';
import { NotificationService } from '../../core/services/notification.service';
import { SharedDocument } from '../../core/models/shared-document.models';
import { downloadBlob } from '../../core/utils/file.util';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-documentos-list',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, ErrorState, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class DocumentosList implements OnInit {
  private readonly sharedDocumentsService = inject(SharedDocumentsService);
  private readonly notification = inject(NotificationService);

  readonly documents = signal<SharedDocument[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly downloadingId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.sharedDocumentsService.getMyDocuments().subscribe({
      next: (documents) => {
        this.documents.set(documents);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  open(doc: SharedDocument): void {
    if (this.downloadingId() !== null) return;

    this.downloadingId.set(doc.id);
    this.sharedDocumentsService.download(doc.id).subscribe({
      next: (blob) => {
        this.downloadingId.set(null);
        downloadBlob(blob, doc.fileName);
      },
      error: () => {
        this.downloadingId.set(null);
        this.notification.error('No se pudo abrir el documento.');
      }
    });
  }
}
