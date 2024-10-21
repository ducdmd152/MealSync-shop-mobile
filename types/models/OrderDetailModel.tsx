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
  optionGroups: OrderDetailOptionGroupModel[];
}

// Main interface for OrderDetail
export default interface OrderDetailModel {
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
  customer: OrderDetailCustomerModel;
  promotion: string | null;
  deliveryPackage: string | null;
  orderDetails: OrderDetailFoodModel[];
}
