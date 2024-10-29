export interface StaffInfoModel {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  isShopOwner: boolean;
}

export interface FrameStaffInfoModel {
  total: number;
  waiting: number;
  delivering: number;
  successful: number;
  failed: number;
  staffInfor: StaffInfoModel;
}
