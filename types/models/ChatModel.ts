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
