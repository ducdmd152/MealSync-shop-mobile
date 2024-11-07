export interface BalanceModel {
  availableAmount: number;
  incomingAmount: number;
  reportingAmount: number;
  isAllowedRequestWithdrawal: boolean;
}
export interface WalletTransaction {
  walletFromId: number;
  nameOfWalletOwnerFrom: string;
  walletToId: number;
  nameOfWalletOwnerTo: string;
  withdrawalRequestId: number | null;
  paymentId: number | null;
  avaiableAmountBefore: number;
  incomingAmountBefore: number;
  reportingAmountBefore: number;
  amount: number;
  type: number;
  description: string;
  createdDate: string;
}

export const sampleWalletTransactionList: WalletTransaction[] = [
  {
    walletFromId: 2,
    nameOfWalletOwnerFrom: "",
    walletToId: 1,
    nameOfWalletOwnerTo: "Bạn",
    withdrawalRequestId: null,
    paymentId: null,
    avaiableAmountBefore: 254100,
    incomingAmountBefore: 0,
    reportingAmountBefore: 0,
    amount: 86336,
    type: 2,
    description: "Tiền từ ví tổng hệ thống chuyển về ví của bạn 86336 VNĐ",
    createdDate: "2024-11-04T17:24:06.33953+00:00",
  },
  {
    walletFromId: 2,
    nameOfWalletOwnerFrom: "",
    walletToId: 1,
    nameOfWalletOwnerTo: "Bạn",
    withdrawalRequestId: null,
    paymentId: null,
    avaiableAmountBefore: 518016,
    incomingAmountBefore: 0,
    reportingAmountBefore: 0,
    amount: 86336,
    type: 1,
    description: "Rút tiền từ ví tổng hệ thống $86336 VNĐ về ví shop id $2",
    createdDate: "2024-11-04T17:24:06.337711+00:00",
  },
  {
    walletFromId: 2,
    nameOfWalletOwnerFrom: "",
    walletToId: 1,
    nameOfWalletOwnerTo: "Bạn",
    withdrawalRequestId: null,
    paymentId: null,
    avaiableAmountBefore: 254100,
    incomingAmountBefore: 0,
    reportingAmountBefore: 0,
    amount: 86336,
    type: 2,
    description: "Tiền từ ví tổng hệ thống chuyển về ví của bạn 86336 VNĐ",
    createdDate: "2024-11-04T17:24:06.33953+00:00",
  },
  {
    walletFromId: 2,
    nameOfWalletOwnerFrom: "",
    walletToId: 1,
    nameOfWalletOwnerTo: "Bạn",
    withdrawalRequestId: null,
    paymentId: null,
    avaiableAmountBefore: 518016,
    incomingAmountBefore: 0,
    reportingAmountBefore: 0,
    amount: 86336,
    type: 1,
    description: "Rút tiền từ ví tổng hệ thống $86336 VNĐ về ví shop id $2",
    createdDate: "2024-11-04T17:24:06.337711+00:00",
  },
  {
    walletFromId: 2,
    nameOfWalletOwnerFrom: "",
    walletToId: 1,
    nameOfWalletOwnerTo: "Bạn",
    withdrawalRequestId: null,
    paymentId: null,
    avaiableAmountBefore: 254100,
    incomingAmountBefore: 0,
    reportingAmountBefore: 0,
    amount: 86336,
    type: 2,
    description: "Tiền từ ví tổng hệ thống chuyển về ví của bạn 86336 VNĐ",
    createdDate: "2024-11-04T17:24:06.33953+00:00",
  },
  {
    walletFromId: 2,
    nameOfWalletOwnerFrom: "",
    walletToId: 1,
    nameOfWalletOwnerTo: "Bạn",
    withdrawalRequestId: null,
    paymentId: null,
    avaiableAmountBefore: 518016,
    incomingAmountBefore: 0,
    reportingAmountBefore: 0,
    amount: 86336,
    type: 1,
    description: "Rút tiền từ ví tổng hệ thống $86336 VNĐ về ví shop id $2",
    createdDate: "2024-11-04T17:24:06.337711+00:00",
  },
  {
    walletFromId: 2,
    nameOfWalletOwnerFrom: "",
    walletToId: 1,
    nameOfWalletOwnerTo: "Bạn",
    withdrawalRequestId: null,
    paymentId: null,
    avaiableAmountBefore: 254100,
    incomingAmountBefore: 0,
    reportingAmountBefore: 0,
    amount: 86336,
    type: 2,
    description: "Tiền từ ví tổng hệ thống chuyển về ví của bạn 86336 VNĐ",
    createdDate: "2024-11-04T17:24:06.33953+00:00",
  },
  {
    walletFromId: 2,
    nameOfWalletOwnerFrom: "",
    walletToId: 1,
    nameOfWalletOwnerTo: "Bạn",
    withdrawalRequestId: null,
    paymentId: null,
    avaiableAmountBefore: 518016,
    incomingAmountBefore: 0,
    reportingAmountBefore: 0,
    amount: 86336,
    type: 1,
    description: "Rút tiền từ ví tổng hệ thống $86336 VNĐ về ví shop id $2",
    createdDate: "2024-11-04T17:24:06.337711+00:00",
  },
];
