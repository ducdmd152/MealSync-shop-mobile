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
  totalPages: number;
  customer: OrderFetchCustomerModel;
  foods: OrderFetchFoodModel[];
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
    bgColor: "bg-yellow-300",
  },
  {
    value: OrderStatus.Rejected,
    description: "Đã từ chối",
    bgColor: "bg-[#fecaca]",
  },
  {
    value: OrderStatus.Confirmed,
    description: "Đã xác nhận",
    bgColor: "bg-green-400",
  },
  {
    value: OrderStatus.Cancelled,
    description: "Đơn hủy",
    bgColor: "bg-gray-400",
  },
  {
    value: OrderStatus.Preparing,
    description: "Đang chuẩn bị",
    bgColor: "bg-blue-200",
  },
  {
    value: OrderStatus.Delivering,
    description: "Đang giao",
    bgColor: "bg-orange-200",
  },
  {
    value: OrderStatus.Delivered,
    description: "Giao thành công",
    bgColor: "bg-green-300",
  },
  {
    value: OrderStatus.FailDelivery,
    description: "Giao thất bại",
    bgColor: "bg-red-300",
  },
  {
    value: OrderStatus.Completed,
    description: "Hoàn tất",
    bgColor: "bg-green-100",
  },
  {
    value: OrderStatus.IssueReported,
    description: "Đang báo cáo",
    bgColor: "bg-yellow-100",
  },
  {
    value: OrderStatus.UnderReview,
    description: "Đang xem xét",
    bgColor: "bg-purple-200",
  },
  {
    value: OrderStatus.Resolved,
    description: "Đã giải quyết",
    bgColor: "bg-green-400",
  },
];

export const getOrderStatusDescription = (
  status: number
): { value: number; description: string; bgColor: string } | undefined => {
  return orderStatusDescMapping.find((item) => item.value === status);
};
export const sampleOrderFetchList: OrderFetchModel[] = [
  {
    id: 7,
    status: OrderStatus.Pending,
    buildingId: 1,
    buildingName: "Tòa A1 - Ký túc xá Khu A - Đại học Quốc gia TP.HCM",
    totalPromotion: 1000,
    totalPrice: 96000,
    orderDate: "2024-10-18T00:04:20.695145",
    receiveAt: null,
    completedAt: null,
    intendedReceiveDate: "2024-10-17T00:00:00",
    startTime: 1000,
    endTime: 1030,
    totalPages: 2,
    customer: {
      id: 1,
      fullName: "Tien",
      phoneNumber: "0868363802",
    },
    foods: [
      {
        id: 1,
        name: "Trà Sen",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg/1200px-C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg",
        quantity: 2,
      },
      {
        id: 1,
        name: "Trà Sen",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg/1200px-C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg",
        quantity: 2,
      },
    ],
  },
  {
    id: 8,
    status: OrderStatus.Rejected,
    buildingId: 1,
    buildingName: "Tòa A1 - Ký túc xá Khu A - Đại học Quốc gia TP.HCM",
    totalPromotion: 1000,
    totalPrice: 96000,
    orderDate: "2024-10-19T08:44:29.835263",
    receiveAt: null,
    completedAt: null,
    intendedReceiveDate: "2024-10-18T00:00:00",
    startTime: 1000,
    endTime: 1030,
    totalPages: 2,
    customer: {
      id: 1,
      fullName: "Tien",
      phoneNumber: "0868363802",
    },
    foods: [
      {
        id: 1,
        name: "Trà Sen",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg/1200px-C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg",
        quantity: 2,
      },
    ],
  },
];
