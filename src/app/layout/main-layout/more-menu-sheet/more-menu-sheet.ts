import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-more-menu-sheet',
  standalone: true,
  imports: [MatListModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './more-menu-sheet.html',
  styleUrl: './more-menu-sheet.scss'
})
export class MoreMenuSheet {
  private readonly sheetRef = inject(MatBottomSheetRef<MoreMenuSheet>);
  private readonly router = inject(Router);

  ir(path: string): void {
    this.sheetRef.dismiss();
    this.router.navigateByUrl(path);
  }
}
