export interface ImageEvidenceModel {
  imageUrl: string;
  takePictureDateTime: string;
}

export interface DeliveryFailModel {
  reason: string;
  reasonIndentity: number; // 1. Shop 2. Customer
  evidences: ImageEvidenceModel[];
}
