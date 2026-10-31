export interface SharedDocumentRecipient {
  userId: number;
  userName: string;
}

export interface SharedDocument {
  id: number;
  title: string;
  category: string;
  notes: string | null;
  fileName: string;
  contentType: string;
  createdAt: string;
  uploadedByUserId: number;
  uploadedByUserName: string;
  recipients: SharedDocumentRecipient[];
}
