export interface CustomerChater {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  roleId: number;
}

export interface ShopChater {
  id: number;
  fullName: string;
  shopName: string;
  phoneNumber: string;
  bannerUrl: string;
  logoUrl: string;
  email: string;
  avatarUrl: string;
  roleId: number;
}

export interface DeliveryStaffChater {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  roleId: number;
}

export interface OrderChannelInfo {
  id: number;
  customer: CustomerChater;
  shop: ShopChater;
  deliveryStaff: DeliveryStaffChater | null;
}
export interface SocketChannelInfo {
  id: number;
  list_user_id: number[];
  map_user_is_read: any;
  last_message: string;
  created_at: string;
  updated_at: string;
}

export interface NotiModel {
  id: number;
  accountId: number;
  referenceId: number;
  imageUrl: string;
  title: string;
  content: string;
  // data: string; // Chuỗi JSON, có thể cần parse thành đối tượng nếu cần dùng chi tiết
  entityType: number;
  isRead: boolean;
  createdDate: string;
}
export enum NotiEntityTypes {
  Order = 1,
}
