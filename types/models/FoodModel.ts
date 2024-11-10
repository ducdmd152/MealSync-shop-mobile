import { OperatingSlotModel } from "./OperatingSlotModel";

export default interface FoodModel {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  isSoldOut: boolean;
  status: number;
  totalOrderInNextTwoHours: number;
  operatingSlots: OperatingSlotModel[];
}
export enum FoodStatus {
  Active = 1,
  UnActive = 2,
  Deleted = 3,
}
