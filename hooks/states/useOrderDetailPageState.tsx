import OrderFetchModel, {
  filterStatuses,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { create } from "zustand";
interface OrderDetailPageState {
  order: OrderFetchModel;
  setOrder: (model: OrderFetchModel) => void;
  onBeforeBack: () => void;
  setOnBeforeBack: (func: () => void) => void;
}

const useOrderDetailPageState = create<OrderDetailPageState>((set) => ({
  order: {} as OrderFetchModel,
  setOrder: (model: OrderFetchModel) => set({ order: model }),
  onBeforeBack: () => {},
  setOnBeforeBack: (func: () => void) => set({ onBeforeBack: func }),
}));

export default useOrderDetailPageState;
