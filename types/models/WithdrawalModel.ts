export interface WalletHistoryModel {
  walletId: number;
  avaiableAmountBefore: number;
  incomingAmountBefore: number;
  reportingAmountBefore: number;
}

export interface WithdrawalModel {
  id: number;
  amount: number;
  status: number;
  bankCode: string;
  bankShortName: string;
  bankAccountNumber: string;
  reason: string | null;
  createdDate: string; // ISO date string format
  walletHistory: WalletHistoryModel;
}

export enum WithdrawalStatus {
  Pending = 1,
  Cancelled = 2,
  UnderReview = 3,
  Approved = 4,
  Rejected = 5,
}

export const withdrawalStatuses = [
  { label: "Chờ xử lí", key: 1, bgColor: "#fde047" },
  { label: "Đã hủy", key: 2, bgColor: "#e5e5e5" },
  { label: "Đang xem xét", key: 3, bgColor: "#7dd3fc" },
  { label: "Hoàn tất", key: 4, bgColor: "#4ade80" },
  { label: "Bị từ chối", key: 5, bgColor: "#f97316" },
];

export const WITHDRAW_STATUSES_FILTER = [
  {
    label: "Tất cả",
    value: [
      WithdrawalStatus.Pending,
      WithdrawalStatus.Cancelled,
      WithdrawalStatus.UnderReview,
      WithdrawalStatus.Approved,
      WithdrawalStatus.Rejected,
    ],
  },
  {
    label: "Đang xử lí",
    value: [WithdrawalStatus.Pending, WithdrawalStatus.UnderReview],
  },
  {
    label: "Đã xử lí",
    value: [
      // WithdrawalStatus.Cancelled,
      WithdrawalStatus.Approved,
      WithdrawalStatus.Rejected,
    ],
  },
];
