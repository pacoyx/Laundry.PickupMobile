import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  output,
  signal,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pad-wrapper">
      <canvas
        #canvas
        class="pad"
        (pointerdown)="startStroke($event)"
        (pointermove)="moveStroke($event)"
        (pointerup)="endStroke()"
        (pointerleave)="endStroke()"
        (pointercancel)="endStroke()"
      ></canvas>
      @if (isEmpty()) {
        <p class="hint">Firme dentro del recuadro</p>
      }
    </div>
    <div class="actions">
      <button mat-stroked-button type="button" (click)="clear()">
        <mat-icon>backspace</mat-icon>
        Limpiar
      </button>
      <button mat-flat-button color="primary" type="button" [disabled]="isEmpty()" (click)="save()">
        <mat-icon>check</mat-icon>
        Guardar firma
      </button>
    </div>
  `,
  styles: `
    .pad-wrapper {
      position: relative;
      border: 2px dashed var(--mat-sys-outline-variant, #c4c7c5);
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
      touch-action: none;
    }
    .pad {
      width: 100%;
      height: 260px;
      display: block;
      touch-action: none;
    }
    .hint {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9aa0a6;
      pointer-events: none;
      margin: 0;
      font-size: 14px;
    }
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }
    .actions button {
      flex: 1;
      min-height: 48px;
    }
  `
})
export class SignaturePad implements AfterViewInit {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private context!: CanvasRenderingContext2D;
  private drawing = false;
  private hasStrokes = false;

  readonly isEmpty = signal(true);
  readonly signatureSaved = output<File>();

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a1a1a';
    this.context = ctx;
  }

  startStroke(event: PointerEvent): void {
    this.drawing = true;
    const { x, y } = this.toCanvasPoint(event);
    this.context.beginPath();
    this.context.moveTo(x, y);
  }

  moveStroke(event: PointerEvent): void {
    if (!this.drawing) {
      return;
    }
    const { x, y } = this.toCanvasPoint(event);
    this.context.lineTo(x, y);
    this.context.stroke();
    this.hasStrokes = true;
    this.isEmpty.set(false);
  }

  endStroke(): void {
    this.drawing = false;
  }

  clear(): void {
    const canvas = this.canvasRef().nativeElement;
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.hasStrokes = false;
    this.isEmpty.set(true);
  }

  save(): void {
    if (!this.hasStrokes) {
      return;
    }
    const canvas = this.canvasRef().nativeElement;
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `firma-${Date.now()}.png`, { type: 'image/png' });
        this.signatureSaved.emit(file);
      }
    }, 'image/png');
  }

  private toCanvasPoint(event: PointerEvent): { x: number; y: number } {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
}
