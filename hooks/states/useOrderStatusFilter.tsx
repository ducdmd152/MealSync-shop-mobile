import { filterStatuses, OrderStatus } from "@/types/models/OrderFetchModel";
import { create } from "zustand";
interface OrderStatusFilterState {
  statuses: OrderStatus[];
  setStatuses: (param: OrderStatus[]) => void;
}

const useOrderStatusFilterState = create<OrderStatusFilterState>((set) => ({
  statuses: filterStatuses[0].statuses,
  setStatuses: (param: OrderStatus[]) => set({ statuses: param }),
}));

export default useOrderStatusFilterState;
