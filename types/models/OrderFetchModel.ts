import {
  OrderDetailCustomerModel as OrderCustomerModel,
  OrderDetailFoodModel,
  OrderPromotionModel,
} from "./OrderDetailModel";
import { ShopDeliveryStaff } from "./StaffInfoModel";

export interface OrderFetchCustomerModel {
  id: number;
  fullName: string;
  phoneNumber: string;
}

export interface OrderFetchFoodModel {
  id: number;
  name: string;
  imageUrl: string;
  quantity: number;
}

export default interface OrderFetchModel {
  id: number;
  status: number;
  dormitoryId: number;
  dormitoryName: string;
  buildingId: number;
  buildingName: string;
  totalPromotion: number;
  totalPrice: number;
  orderDate: string;
  receiveAt: string | null;
  completedAt: string | null;
  intendedReceiveDate: string;
  startTime: number;
  endTime: number;
  note: string | null;
  customer: OrderCustomerModel;
  promotion: OrderPromotionModel | null;
  orderDetails: OrderDetailFoodModel[];
  shopDeliveryStaff: ShopDeliveryStaff | null;
  orderDetailSummary: string;
  orderDetailSummaryShort: string;
}

export enum OrderStatus {
  Pending = 1,
  Rejected = 2,
  Confirmed = 3,
  Cancelled = 4,
  Preparing = 5,
  Delivering = 6,
  Delivered = 7,
  FailDelivery = 8,
  Completed = 9,
  IssueReported = 10,
  UnderReview = 11,
  Resolved = 12,
}
export const orderStatusDescMapping = [
  {
    value: OrderStatus.Pending,
    description: "Chờ xác nhận",
    bgColor: "#fcd34d",
  },
  {
    value: OrderStatus.Rejected,
    description: "Đã từ chối",
    bgColor: "#fecaca",
  },
  {
    value: OrderStatus.Confirmed,
    description: "Đã xác nhận",
    bgColor: "#d9f99d",
  },
  {
    value: OrderStatus.Cancelled,
    description: "Đơn hủy",
    bgColor: "#e2e8f0",
  },
  {
    value: OrderStatus.Preparing,
    description: "Đang chuẩn bị",
    bgColor: "#a5f3fc",
  },
  {
    value: OrderStatus.Delivering,
    description: "Đang giao",
    bgColor: "#22d3ee",
  },
  {
    value: OrderStatus.Delivered,
    description: "Giao thành công",
    bgColor: "#34d399",
  },
  {
    value: OrderStatus.FailDelivery,
    description: "Giao thất bại",
    bgColor: "#f87171",
  },
  {
    value: OrderStatus.Completed,
    description: "Hoàn tất",
    bgColor: "#0891b2",
  },
  {
    value: OrderStatus.IssueReported,
    description: "Đơn báo cáo",
    bgColor: "#fdba74",
  },
  {
    value: OrderStatus.UnderReview,
    description: "Đang xem xét",
    bgColor: "#f59e0b",
  },
  {
    value: OrderStatus.Resolved,
    description: "Hoàn tất",
    // description: "Đã giải quyết",
    bgColor: "#0891b2",
  },
];

export const getOrderStatusDescription = (
  status: number
): { value: number; description: string; bgColor: string } | undefined => {
  return orderStatusDescMapping.find((item) => item.value === status);
};
// export const sampleOrderFetchList: OrderFetchModel[] = [
//   {
//     id: 7,
//     status: OrderStatus.Pending,
//     dormitoryId: 1,
//     buildingId: 1,
//     buildingName: "Tòa A1 - Ký túc xá Khu A - Đại học Quốc gia TP.HCM",
//     totalPromotion: 1000,
//     totalPrice: 96000,
//     orderDate: "2024-10-18T00:04:20.695145",
//     receiveAt: null,
//     completedAt: null,
//     intendedReceiveDate: "2024-10-17T00:00:00",
//     startTime: 1000,
//     endTime: 1030,
//     totalPages: 2,
//     customer: {
//       id: 1,
//       fullName: "Tien",
//       phoneNumber: "0868363802",
//     },
//     foods: [
//       {
//         id: 1,
//         name: "Trà Sen",
//         imageUrl:
//           "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg/1200px-C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg",
//         quantity: 2,
//       },
//       {
//         id: 1,
//         name: "Trà Sen",
//         imageUrl:
//           "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg/1200px-C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg",
//         quantity: 2,
//       },
//     ],
//   },
//   {
//     id: 8,
//     status: OrderStatus.Rejected,
//     dormitoryId: 1,
//     buildingId: 1,
//     buildingName: "Tòa A1 - Ký túc xá Khu A - Đại học Quốc gia TP.HCM",
//     totalPromotion: 1000,
//     totalPrice: 96000,
//     orderDate: "2024-10-19T08:44:29.835263",
//     receiveAt: null,
//     completedAt: null,
//     intendedReceiveDate: "2024-10-18T00:00:00",
//     startTime: 1000,
//     endTime: 1030,
//     totalPages: 2,
//     customer: {
//       id: 1,
//       fullName: "Tien",
//       phoneNumber: "0868363802",
//     },
//     foods: [
//       {
//         id: 1,
//         name: "Trà Sen",
//         imageUrl:
//           "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg/1200px-C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg",
//         quantity: 2,
//       },
//     ],
//   },
// ];
export const filterStatuses = [
  {
    statuses: [
      OrderStatus.Pending,
      OrderStatus.Confirmed,
      OrderStatus.Preparing,
      OrderStatus.Delivering,
      OrderStatus.Delivered,
      OrderStatus.FailDelivery,
      OrderStatus.IssueReported,
      OrderStatus.UnderReview,
      OrderStatus.Completed,
      OrderStatus.Resolved,
      OrderStatus.Rejected,
      OrderStatus.Cancelled,
    ],
    label: "Tất cả",
  },
  {
    statuses: [OrderStatus.Pending],
    label: "Chờ xác nhận",
  },
  {
    statuses: [OrderStatus.Confirmed],
    label: "Đã xác nhận",
  },
  {
    statuses: [OrderStatus.Preparing],
    label: "Đang chuẩn bị",
  },
  {
    statuses: [OrderStatus.Delivering],
    label: "Đang giao",
  },
  {
    statuses: [OrderStatus.Delivered],
    label: "Giao thành công",
  },
  {
    statuses: [OrderStatus.FailDelivery],
    label: "Giao hàng thất bại",
  },
  {
    statuses: [OrderStatus.IssueReported, OrderStatus.UnderReview],
    label: "Đang báo cáo",
  },
  {
    statuses: [OrderStatus.Completed, OrderStatus.Resolved],
    label: "Hoàn tất",
  },
  {
    statuses: [OrderStatus.Rejected],
    label: "Đã từ chối",
  },
  {
    statuses: [OrderStatus.Cancelled],
    label: "Đơn hủy",
  },
];
