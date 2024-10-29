import { FrameDateTime } from "./TimeModel";

export interface DeliveryPackage extends FrameDateTime {
  orderIds: number[];
  shopDeliveryStaffId: number | null;
}
