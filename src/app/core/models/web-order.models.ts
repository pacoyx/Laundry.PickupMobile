export interface WebOrderListItem {
  id: number;
  orderNumber: string;
  deliveryAddress: string;
  contactPhone: string;
  scheduledPickupDate: string;
  status: string;
  workGuideSerie: string;
  workGuideNumero: string;
}

export interface WebOrderPhoto {
  id: number;
  workGuideMainId: number;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface CompleteWebOrderRequest {
  observation?: string | null;
}
