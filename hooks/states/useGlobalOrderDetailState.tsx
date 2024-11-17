import OrderDetailModel from "@/types/models/OrderDetailModel";
import { filterStatuses, OrderStatus } from "@/types/models/OrderFetchModel";
import { create } from "zustand";
interface GlobalOrderDetailState {
  id: number;
  setId: (param: number) => void;
  isDetailBottomSheetVisible: boolean;
  setIsDetailBottomSheetVisible: (param: boolean) => void;
  model: OrderDetailModel;
  setModel: (param: OrderDetailModel) => void;
  isActionsShowing: boolean;
  setIsActionsShowing: (param: boolean) => void;

  onAfterCompleted: () => void;
  setOnAfterCompleted: (func: () => void) => void;
}

const useGlobalOrderDetailState = create<GlobalOrderDetailState>((set) => ({
  id: 0,
  setId: (param: number) => set({ id: param }),
  isDetailBottomSheetVisible: false,
  setIsDetailBottomSheetVisible: (param: boolean) =>
    set({ isDetailBottomSheetVisible: param }),
  isActionsShowing: true,
  setIsActionsShowing: (param: boolean) => set({ isActionsShowing: param }),
  model: {} as OrderDetailModel,
  setModel: (param: OrderDetailModel) => set({ model: param }),
  onAfterCompleted: () => {},
  setOnAfterCompleted: (func: () => void) => set({ onAfterCompleted: func }),
}));

export default useGlobalOrderDetailState;
