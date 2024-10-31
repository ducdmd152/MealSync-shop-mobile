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
  extends DeliveryPackageGroupDetailsModel {
  intendedReceiveDate: string;
  startTime: number;
  endTime: number;
  deliveryPackageGroups: DeliveryPackageModel[];
}

export interface DeliveryPackageGroupDetailsModel {
  deliverPackageGroup: DeliveryPackageModel[];
  unassignOrders: OrderFetchModel[];
}
