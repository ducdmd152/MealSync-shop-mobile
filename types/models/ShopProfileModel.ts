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

export interface OperatingSlotModel {
  id: number;
  title: string;
  startTime: number;
  endTime: number;
  timeSlot: string;
}

export interface ShopProfileGetModel {
  id: number;
  name: string;
  shopOwnerName: string;
  logoUrl: string;
  bannerUrl: string;
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
