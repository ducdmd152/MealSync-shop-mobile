export default interface PromotionModel {
  id: number;
  title: string;
  description: string;
  bannerUrl: string;
  amountRate: number;
  minimumOrderValue: number;
  maximumApplyValue: number;
  amountValue: number;
  applyType: number;
  status: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  numberOfUsed: number;
  promotionType: number;
  createdDate: string;
  updatedDate: string;
}
export const promotionStatuses = [
  { label: "Khả dụng", key: 1 },
  { label: "Đã tắt", key: 2 },
  { label: "Đã xóa", key: 3 },
];

export const promotionApplyTypes = [
  { label: "Áp dụng tỷ lệ", key: 1 },
  { label: "Áp dụng giá trị", key: 2 },
];

export enum PromotionApplyType {
  RateApply = 1,
  AmountApply = 2,
}
export enum PromotionStatus {
  Active = 1,
  UnActive = 2,
  Deleted = 3,
}
