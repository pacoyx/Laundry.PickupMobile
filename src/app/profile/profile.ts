import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatListModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  readonly auth = inject(AuthService);
  readonly appVersion = environment.appVersion;

  logout(): void {
    this.auth.logout();
  }
}
