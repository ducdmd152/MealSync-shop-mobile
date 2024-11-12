import { filterStatuses, OrderStatus } from "@/types/models/OrderFetchModel";
import { create } from "zustand";
interface GlobalCompleteDeliveryConfirm {
  id: number;
  setId: (param: number) => void;
  isModalVisible: boolean;
  setIsModalVisible: (param: boolean) => void;
  onAfterCompleted: () => void;
  setOnAfterCompleted: (func: () => void) => void;
}

const useGlobalCompleteDeliveryConfirm = create<GlobalCompleteDeliveryConfirm>(
  (set) => ({
    id: 0,
    setId: (param: number) => set({ id: param }),
    isModalVisible: false,
    setIsModalVisible: (param: boolean) => set({ isModalVisible: param }),
    onAfterCompleted: () => {},
    setOnAfterCompleted: (func: () => void) => set({ onAfterCompleted: func }),
  })
);

export default useGlobalCompleteDeliveryConfirm;
