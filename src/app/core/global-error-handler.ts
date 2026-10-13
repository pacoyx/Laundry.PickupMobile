import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { NotificationService } from './services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notification = inject(NotificationService);
  private readonly zone = inject(NgZone);

  handleError(error: unknown): void {
    console.error('Error no controlado:', error);
    this.zone.run(() => this.notification.error('Ocurrió un error inesperado en la aplicación.'));
  }
}
