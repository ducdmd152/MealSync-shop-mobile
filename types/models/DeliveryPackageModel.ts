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
  intendedReceiveDate: string;
  startTime: number;
  endTime: number;
  deliveryPackageGroups: DeliveryPackageModel[];
  unassignOrders: OrderFetchModel[];
}

export enum DeliveryPackageStatus {
  Pending = 1,
  OnGoing = 2,
  Completed = 3,
}

export interface OwnDeliveryPackageModel extends DeliveryPackageModel {
  startTime: number;
  endTime: number;
  intendedReceiveDate: string;
}
