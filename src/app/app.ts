import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { DriverLocationService } from './core/services/driver-location.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Laundry.PickupMobile');

  private readonly authService = inject(AuthService);
  private readonly driverLocationService = inject(DriverLocationService);

  constructor() {
    // Mientras haya sesion activa (chofer logueado con la app abierta), se manda su ubicacion
    // periodicamente. Se detiene apenas cierra sesion.
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.driverLocationService.start();
      } else {
        this.driverLocationService.stop();
      }
    });
  }
}
