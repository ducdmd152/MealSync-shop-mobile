import OrderFetchModel, {
  filterStatuses,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { create } from "zustand";
interface OrderDetailPageState {
  id: number;
  setId: (param: number) => void;

  order: OrderFetchModel;
  setOrder: (model: OrderFetchModel) => void;
  onBeforeBack: () => void;
  setOnBeforeBack: (func: () => void) => void;
}

const useOrderDetailPageState = create<OrderDetailPageState>((set) => ({
  id: 0,
  setId: (param: number) => set({ id: param }),
  order: {} as OrderFetchModel,
  setOrder: (model: OrderFetchModel) => set({ order: model }),
  onBeforeBack: () => {},
  setOnBeforeBack: (func: () => void) => set({ onBeforeBack: func }),
}));

export default useOrderDetailPageState;
