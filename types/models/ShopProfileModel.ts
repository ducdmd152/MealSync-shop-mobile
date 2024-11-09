export interface Location {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
}

export interface ShopDormitoryModel {
  dormitoryId: number;
  name: string;
}

export enum Dormitories {
  A = 1,
  B = 2,
}
export interface OperatingSlotModel {
  id: number;
  title: string;
  startTime: number;
  endTime: number;
  timeSlot: string;
  isActive: boolean;
  isReceivingOrderPaused: boolean;
}

export interface ShopProfileGetModel {
  id: number;
  name: string;
  description: string;
  shopOwnerName: string;
  logoUrl: string;
  bannerUrl: string;
  email: string;

  phoneNumber: string;
  status: number;
  isAcceptingOrderNextDay: boolean;
  isReceivingOrderPaused: boolean;
  minValueOrderFreeShip: number;
  additionalShipFee: number;
  isAutoOrderConfirmation: boolean;
  maxOrderHoursInAdvance: number;
  minOrderHoursInAdvance: number;
  location: Location;
  shopDormitories: ShopDormitoryModel[];
  operatingSlots: OperatingSlotModel[];
}
