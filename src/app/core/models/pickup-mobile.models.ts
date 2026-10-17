export enum PickupGuideStatus {
  Draft = 1,
  Collected = 2,
  Processed = 3,
  Invoiced = 4,
  Cancelled = 5
}

export const PICKUP_GUIDE_STATUS_LABELS: Record<PickupGuideStatus, string> = {
  [PickupGuideStatus.Draft]: 'Borrador',
  [PickupGuideStatus.Collected]: 'Recolectada',
  [PickupGuideStatus.Processed]: 'Procesada',
  [PickupGuideStatus.Invoiced]: 'Facturada',
  [PickupGuideStatus.Cancelled]: 'Anulada'
};

export enum PickupGuideAttachmentType {
  Photo = 1,
  Signature = 2,
  Pdf = 3,
  PhysicalGuidePhoto = 4
}

export interface CustomerLookup {
  id: number;
  businessName: string;
}

export interface VehicleLookup {
  id: number;
  plate: string;
  description: string;
}

export interface EmployeeLookup {
  id: number;
  fullName: string;
}

export interface ServiceItemLookup {
  id: number;
  name: string;
  unitPrice: number;
}

export interface DashboardSummary {
  todayPickupGuides: number;
  draftPickupGuides: number;
  totalPickupGuides: number;
}

export interface PickupGuideListItem {
  id: number;
  guideNumber: string;
  customer: string;
  date: string;
  status: PickupGuideStatus;
  hasPhotos: boolean;
  hasSignature: boolean;
}

export interface PickupGuideAttachment {
  id: number;
  attachmentType: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface PickupGuideDetailLineRequest {
  serviceItemId: number;
  quantity: number;
  weight: number | null;
  observation: string | null;
}

export interface PickupGuideDetailLine {
  id: number;
  serviceItemId: number;
  serviceItemName: string;
  quantity: number;
  weight: number | null;
  unitPrice: number;
  total: number;
  observation: string | null;
}

export interface PickupGuideAttachmentResponse {
  id: number;
  pickupGuideId: number;
  attachmentType: PickupGuideAttachmentType;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  isCurrent: boolean;
  createdAt: string;
}

export interface PickupGuideRevision {
  revisionDate: string;
  employeeName: string;
  observation: string;
  items: {
    serviceName: string;
    originalQuantity: number;
    newQuantity: number;
    reason: string;
  }[];
}

export interface PickupGuideDetail {
  id: number;
  guideNumber: string;
  customerId: number;
  customerName: string;
  branchSalesId: number;
  pickupDate: string;
  status: PickupGuideStatus;
  observation: string | null;
  customerPriceListId: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string | null;
  employeeId: number | null;
  employeeName: string | null;
  vehicleId: number | null;
  vehiclePlate: string | null;
  vehicleDescription: string | null;
  details: PickupGuideDetailLine[];
  attachments: PickupGuideAttachmentResponse[];
  revisions: PickupGuideRevision[];
}

export interface CreatePickupGuideRequest {
  customerId: number;
  branchSalesId: number;
  pickupDate: string;
  observation: string | null;
  vehicleId: number | null;
  details: PickupGuideDetailLineRequest[];
}

export type UpdatePickupGuideRequest = CreatePickupGuideRequest;

export interface PickupGuideDraft {
  customer: CustomerLookup | null;
  vehicle: VehicleLookup | null;
  branchSalesId: number | null;
  pickupDate: Date;
  details: (PickupGuideDetailLineRequest & { serviceItemName: string; unitPrice: number })[];
  observation: string;
}
