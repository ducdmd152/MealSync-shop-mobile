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
