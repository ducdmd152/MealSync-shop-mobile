import OrderFetchModel from "./OrderFetchModel";
import { StaffInfoModel } from "./StaffInfoModel";
import { FrameDateTime } from "./TimeModel";

export interface DormitoryGPKGModel {
  id: number;
  name: string;
  total: number;
  waiting: number;
  delivering: number;
  successful: number;
  failed: number;
}
export interface DeliveryPackageModel {
  deliveryPackageId: number;
  status: number;
  total: number;
  waiting: number;
  delivering: number;
  successful: number;
  failed: number;
  shopDeliveryStaff: StaffInfoModel;
  dormitories: DormitoryGPKGModel[];
  orders: OrderFetchModel[];
}

export interface DeliveryPackageGroupModel
  extends DeliveryPackageGroupDetailsModel {}

export interface DeliveryPackageGroupDetailsModel {
  startTime: number;
  endTime: number;
  deliveryPackageGroups: DeliveryPackageModel[];
  unassignOrders: OrderFetchModel[];
  intendedReceiveDate: string;
}

export enum DeliveryPackageStatus {
  Pending = 1,
  OnGoing = 2,
  Completed = 3,
}
export const deliveryPackageDescMapping = [
  {
    value: DeliveryPackageStatus.Pending,
    description: "Chưa xử lí",
    bgColor: "#d1d5db",
  },
  {
    value: DeliveryPackageStatus.OnGoing,
    description: "Đang giao",
    bgColor: "#fdba74",
  },
  {
    value: DeliveryPackageStatus.Completed,
    description: "Hoàn tất",
    bgColor: "#34d399",
  },
];

export const getDeliveryPackageStatusDescription = (
  status: number,
): { value: number; description: string; bgColor: string } | undefined => {
  return deliveryPackageDescMapping.find((item) => item.value === status);
};

export interface OwnDeliveryPackageModel extends DeliveryPackageModel {
  startTime: number;
  endTime: number;
  intendedReceiveDate: string;
  deliveryDate: string;
}
