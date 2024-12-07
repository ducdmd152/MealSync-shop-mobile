import { FoodPackingUnit } from "./FoodPackagingUnitModel";
import { OperatingSlotModel } from "./OperatingSlotModel";
import OptionGroupModel from "./OptionGroupModel";
export interface FoodOptionGroupModel {
  optionGroupId: number;
  displayOrder: number;
}
export default interface FoodDetailModel {
  id: number;
  platformCategoryId: number;
  shopCategoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  status: number;
  isSoldOut: boolean;
  foodPackingUnit: FoodPackingUnit;
  operatingSlots: OperatingSlotModel[];
  optionGroups?: FoodOptionGroupModel[];
}
