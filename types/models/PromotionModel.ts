import dayjs from "dayjs";

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

export const initPromotionSampleObject = {
  id: 0,
  title: "",
  description: "",
  bannerUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5UW3VOtxCrPlSPnHEWVi_OndZbv7IzamS6g&s",
  amountRate: 0,
  minimumOrderValue: 1000,
  maximumApplyValue: 40000,
  amountValue: 0,
  applyType: PromotionApplyType.RateApply,
  status: PromotionStatus.Active,
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  usageLimit: 100,
  numberOfUsed: 0,
  promotionType: 1,
} as PromotionModel;
