import { filterStatuses, OrderStatus } from "@/types/models/OrderFetchModel";
import { create } from "zustand";
interface GlobalImageViewingState {
  url: string;
  setUrl: (param: string) => void;
  isModalVisible: boolean;
  setIsModalVisible: (param: boolean) => void;
}

const useGlobalImageViewingState = create<GlobalImageViewingState>((set) => ({
  url: "",
  setUrl: (param: string) => set({ url: param }),
  isModalVisible: false,
  setIsModalVisible: (param: boolean) => set({ isModalVisible: param }),
}));

export default useGlobalImageViewingState;
