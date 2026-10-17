import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';

import { AuthService } from '../../core/services/auth.service';
import { CustomersService } from '../../core/services/customers.service';
import { VehiclesService } from '../../core/services/vehicles.service';
import { ServiceItemsService } from '../../core/services/service-items.service';
import { PickupGuidesService } from '../../core/services/pickup-guides.service';
import { NotificationService } from '../../core/services/notification.service';
import { getErrorMessage } from '../../core/utils/error.util';
import {
  CreatePickupGuideRequest,
  CustomerLookup,
  PickupGuideAttachmentResponse,
  PickupGuideDraft,
  PickupGuideStatus,
  ServiceItemLookup,
  VehicleLookup
} from '../../core/models/pickup-mobile.models';
import { SignaturePad } from '../../shared/components/signature-pad/signature-pad';
import { PhotoCapture } from '../../shared/components/photo-capture/photo-capture';
import { PickupGuideAttachmentType } from '../../core/models/pickup-mobile.models';
import { AttachmentsService } from '../../core/services/attachments.service';

@Component({
  selector: 'app-pickup-guide-new',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatStepperModule,
    SignaturePad,
    PhotoCapture
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new.html',
  styleUrl: './new.scss'
})
export class PickupGuideNew implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customersService = inject(CustomersService);
  private readonly vehiclesService = inject(VehiclesService);
  private readonly serviceItemsService = inject(ServiceItemsService);
  private readonly pickupGuidesService = inject(PickupGuidesService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly notification = inject(NotificationService);
  readonly auth = inject(AuthService);

  readonly physicalGuidePhotoType = PickupGuideAttachmentType.PhysicalGuidePhoto;

  readonly guideId = signal<number | null>(null);
  readonly loadingInitial = signal(false);
  readonly saving = signal(false);
  readonly readOnlyBlocked = signal(false);

  readonly vehicles = signal<VehicleLookup[]>([]);
  readonly customerOptions = signal<CustomerLookup[]>([]);
  readonly serviceItems = signal<ServiceItemLookup[]>([]);
  readonly attachments = signal<PickupGuideAttachmentResponse[]>([]);

  readonly draft = signal<PickupGuideDraft>({
    customer: null,
    vehicle: null,
    branchSalesId: null,
    pickupDate: new Date(),
    details: [],
    observation: ''
  });

  customerSearchTerm = '';
  private readonly customerSearch$ = new Subject<string>();

  newLineServiceItemId: number | null = null;
  newLineQuantity = 1;
  newLineWeight: number | null = null;
  newLineObservation = '';

  get employeeDisplayName(): string {
    return this.auth.profile()?.fullName ?? 'Recolector autenticado';
  }

  get branchSalesOptions() {
    return this.auth.profile()?.branchSales ?? [];
  }

  get estimatedTotal(): number {
    return this.draft().details.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  }

  ngOnInit(): void {
    this.vehiclesService.getAll().subscribe((vehicles) => this.vehicles.set(vehicles));

    this.customerSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.customersService.search(term))
      )
      .subscribe((options) => this.customerOptions.set(options));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadExisting(Number(idParam));
      return;
    }

    const branches = this.branchSalesOptions;
    if (branches.length === 1) {
      this.draft.update((d) => ({ ...d, branchSalesId: branches[0].branchSalesId }));
    }
  }

  private loadExisting(id: number): void {
    this.loadingInitial.set(true);
    this.pickupGuidesService.getById(id).subscribe({
      next: (guide) => {
        if (guide.status !== PickupGuideStatus.Draft) {
          this.notification.error('Solo se pueden editar guías en estado Borrador.');
          this.router.navigate(['/pickup-guides', id]);
          return;
        }
        this.guideId.set(guide.id);
        this.attachments.set(guide.attachments);
        this.draft.set({
          customer: { id: guide.customerId, businessName: guide.customerName },
          vehicle: guide.vehicleId
            ? { id: guide.vehicleId, plate: guide.vehiclePlate ?? '', description: guide.vehicleDescription ?? '' }
            : null,
          branchSalesId: guide.branchSalesId,
          pickupDate: new Date(guide.pickupDate),
          details: guide.details.map((d) => ({
            serviceItemId: d.serviceItemId,
            quantity: d.quantity,
            weight: d.weight,
            observation: d.observation,
            serviceItemName: d.serviceItemName,
            unitPrice: d.unitPrice
          })),
          observation: guide.observation ?? ''
        });
        this.loadServiceItems(guide.customerId);
        this.loadingInitial.set(false);
      },
      error: () => {
        this.loadingInitial.set(false);
        this.notification.error('No se pudo cargar la guía para editar.');
        this.router.navigate(['/pickup-guides']);
      }
    });
  }

  onCustomerSearch(term: string): void {
    this.customerSearchTerm = term;
    this.customerSearch$.next(term);
  }

  selectCustomer(customer: CustomerLookup): void {
    this.draft.update((d) => ({ ...d, customer, details: d.customer?.id === customer.id ? d.details : [] }));
    this.loadServiceItems(customer.id);
  }

  private loadServiceItems(customerId: number): void {
    this.serviceItemsService.getByCustomer(customerId).subscribe((items) => this.serviceItems.set(items));
  }

  selectVehicle(vehicle: VehicleLookup | null): void {
    this.draft.update((d) => ({ ...d, vehicle }));
  }

  compareVehicles(a: VehicleLookup | null, b: VehicleLookup | null): boolean {
    return (a?.id ?? null) === (b?.id ?? null);
  }

  selectBranchSales(branchSalesId: number): void {
    this.draft.update((d) => ({ ...d, branchSalesId }));
  }

  addDetailLine(): void {
    const serviceItem = this.serviceItems().find((s) => s.id === this.newLineServiceItemId);
    if (!serviceItem || this.newLineQuantity <= 0) {
      return;
    }
    this.draft.update((d) => ({
      ...d,
      details: [
        ...d.details,
        {
          serviceItemId: serviceItem.id,
          serviceItemName: serviceItem.name,
          unitPrice: serviceItem.unitPrice,
          quantity: this.newLineQuantity,
          weight: this.newLineWeight,
          observation: this.newLineObservation || null
        }
      ]
    }));
    this.newLineServiceItemId = null;
    this.newLineQuantity = 1;
    this.newLineWeight = null;
    this.newLineObservation = '';
  }

  removeDetailLine(index: number): void {
    this.draft.update((d) => ({ ...d, details: d.details.filter((_, i) => i !== index) }));
  }

  updateObservation(value: string): void {
    this.draft.update((d) => ({ ...d, observation: value }));
  }

  canSaveDraft(): boolean {
    const d = this.draft();
    return !!d.customer && !!d.branchSalesId && d.details.length > 0;
  }

  private buildRequest(): CreatePickupGuideRequest {
    const d = this.draft();
    return {
      customerId: d.customer!.id,
      branchSalesId: d.branchSalesId!,
      pickupDate: d.pickupDate.toISOString(),
      observation: d.observation || null,
      vehicleId: d.vehicle?.id ?? null,
      details: d.details.map(({ serviceItemId, quantity, weight, observation }) => ({ serviceItemId, quantity, weight, observation }))
    };
  }

  ensureGuideSaved(onSuccess: () => void): void {
    if (!this.canSaveDraft()) {
      this.notification.error('Complete cliente y al menos un servicio antes de continuar.');
      return;
    }
    this.saving.set(true);
    const request = this.buildRequest();
    const currentId = this.guideId();
    const call = currentId ? this.pickupGuidesService.update(currentId, request) : this.pickupGuidesService.create(request);

    call.subscribe({
      next: (guide) => {
        this.guideId.set(guide.id);
        this.attachments.set(guide.attachments);
        this.saving.set(false);
        onSuccess();
      },
      error: (error) => {
        this.saving.set(false);
        this.notification.error(getErrorMessage(error, 'No se pudo guardar la guía de recojo.'));
      }
    });
  }

  saveAndContinue(stepper: MatStepper): void {
    this.ensureGuideSaved(() => stepper.next());
  }

  finish(): void {
    this.notification.success('Guía registrada correctamente.');
    this.router.navigate(['/pickup-guides', this.guideId()]);
  }

  onSignatureSaved(file: File): void {
    const id = this.guideId();
    if (!id) {
      return;
    }
    this.attachmentsService.upload(id, file, PickupGuideAttachmentType.Signature).subscribe({
      next: () => this.notification.success('Firma guardada correctamente.'),
      error: (error) => this.notification.error(getErrorMessage(error, 'No se pudo guardar la firma.'))
    });
  }

  cancel(): void {
    this.router.navigate(['/pickup-guides']);
  }
}
