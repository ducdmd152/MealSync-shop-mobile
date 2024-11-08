export interface StaffInfoModel {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  isShopOwner: boolean;
}

export interface ShopDeliveryStaff {
  deliveryPackageId: number;
  id: number;
  fullName: string;
  avatarUrl: string;
  isShopOwnerShip: boolean;
}

export interface FrameStaffInfoModel {
  total: number;
  waiting: number;
  delivering: number;
  successful: number;
  failed: number;
  staffInfor: StaffInfoModel;
}

export interface ShopDeliveryStaffModel {
  id: number;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  fullName: string;
  genders: number;
  accountStatus: number;
  shopDeliveryStaffStatus: number;
  createdDate: string;
  updatedDate: string;
}

export enum ShopDeliveryStaffStatus {
  On = 1,
  Off = 2,
  Inactive = 3,
}

export const emptyShopDeliveryStaff: ShopDeliveryStaffModel = {
  id: 0,
  phoneNumber: "",
  email: "",
  avatarUrl: "",
  fullName: "",
  genders: 0,
  accountStatus: 0,
  shopDeliveryStaffStatus: 1,
  createdDate: "",
  updatedDate: "",
};
