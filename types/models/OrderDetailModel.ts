import OrderFetchModel from "./OrderFetchModel";
import { ShopDeliveryStaff } from "./StaffInfoModel";

// Interface for customer details
export interface OrderDetailCustomerModel {
  id: number;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  locationId: number;
  address: string;
  latitude: number;
  longitude: number;
}

// Interface for food option details
export interface OrderDetailOptionModel {
  optionTitle: string;
  optionImageUrl: string;
  isCalculatePrice: boolean;
  price: number;
}

// Interface for option group
export interface OrderDetailOptionGroupModel {
  optionGroupTitle: string;
  options: OrderDetailOptionModel[];
}

// Interface for individual order items (foods)
export interface OrderDetailFoodModel {
  id: number;
  foodId: number;
  name: string;
  imageUrl: string;
  description: string;
  quantity: number;
  totalPrice: number;
  basicPrice: number;
  note: string;
  optionGroups: OrderDetailOptionGroupModel[];
}

export interface OrderPromotionModel {
  id: number;
  title: string;
  description: string;
  bannerUrl: string | null;
  amountRate: number;
  amountValue: number;
  minOrderValue: number;
  applyType: number;
  maximumApplyValue: number;
}
// Main interface for OrderDetail
export default interface OrderDetailModel extends OrderFetchModel {
  // summary: food1 x3, food2 x4, food3 x3
  // summaryShort: food1 x3 +7 món khác
}
