import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

// Captura la ubicacion mientras el chofer tiene la app abierta (primer plano). No funciona con
// el celular bloqueado o la app minimizada -eso requeriria empaquetar la app con Capacitor y un
// plugin de background geolocation, que queda fuera de alcance por ahora.
@Injectable({ providedIn: 'root' })
export class DriverLocationService {
  private readonly http = inject(HttpClient);

  private watchId: number | null = null;
  private lastSentAt = 0;
  private readonly minIntervalMs = 25_000;

  start(): void {
    if (this.watchId !== null || !('geolocation' in navigator)) {
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePosition(position),
      (error) => console.warn('No se pudo obtener la ubicación:', error.message),
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 20_000 }
    );
  }

  stop(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private handlePosition(position: GeolocationPosition): void {
    const now = Date.now();
    if (now - this.lastSentAt < this.minIntervalMs) {
      return;
    }
    this.lastSentAt = now;

    const payload = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracyMeters: position.coords.accuracy,
      recordedAt: new Date(position.timestamp).toISOString(),
    };

    this.http.post(`${environment.apiUrl}/pickup-mobile/location`, payload).subscribe({
      error: (err) => console.warn('No se pudo enviar la ubicación:', err),
    });
  }
}
