import { filterStatuses, OrderStatus } from "@/types/models/OrderFetchModel";
import { ShopDeliveryStaffModel } from "@/types/models/StaffInfoModel";
import { create } from "zustand";
interface Query {
  searchText: string;
  status: number;
}
interface GlobalStaffState {
  id: number;
  setId: (param: number) => void;
  isDetaiModalVisible: boolean;
  setIsDetailModalVisible: (param: boolean) => void;
  query: Query;
  setQuery: (param: Query) => void;
  model: ShopDeliveryStaffModel;
  setModel: (param: ShopDeliveryStaffModel) => void;
}

const useGlobalStaffState = create<GlobalStaffState>((set) => ({
  id: 0,
  setId: (param: number) => set({ id: param }),
  isDetaiModalVisible: false,
  setIsDetailModalVisible: (param: boolean) =>
    set({ isDetaiModalVisible: param }),
  query: { searchText: "", status: 0 },
  setQuery: (param: Query) => set({ query: param }),
  model: {} as ShopDeliveryStaffModel,
  setModel: (param: ShopDeliveryStaffModel) => set({ model: param }),
}));

export default useGlobalStaffState;
