import { filterStatuses, OrderStatus } from "@/types/models/OrderFetchModel";
import { create } from "zustand";
interface GlobalOrderDetailState {
  id: number;
  setId: (param: number) => void;
  isDetailBottomSheetVisible: boolean;
  setIsDetailBottomSheetVisible: (param: boolean) => void;
  isActionsShowing: boolean;
  setIsActionsShowing: (param: boolean) => void;
}

const useGlobalOrderDetailState = create<GlobalOrderDetailState>((set) => ({
  id: 0,
  setId: (param: number) => set({ id: param }),
  isDetailBottomSheetVisible: false,
  setIsDetailBottomSheetVisible: (param: boolean) =>
    set({ isDetailBottomSheetVisible: param }),
  isActionsShowing: true,
  setIsActionsShowing: (param: boolean) => set({ isActionsShowing: param }),
}));

export default useGlobalOrderDetailState;
