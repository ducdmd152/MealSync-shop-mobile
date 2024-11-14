import OrderFetchModel, {
  filterStatuses,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { ReactNode } from "react";
import { create } from "zustand";
interface GlobalCompleteDeliveryConfirm {
  id: number;
  setId: (param: number) => void;
  isModalVisible: boolean;
  setIsModalVisible: (param: boolean) => void;
  onAfterCompleted: () => void;
  setOnAfterCompleted: (func: () => void) => void;
  step: number; // 0. choose action 1. Scan QR Successful Code 2. Failed Delivery Submit
  setStep: (step: number) => void;
  model: OrderFetchModel;
  setModel: (model: OrderFetchModel) => void;
  title: string;
  setTitle: (title: string) => void;
  isShowActionale: boolean;
  setIsShowActionale: (param: boolean) => void;
}

const useGlobalCompleteDeliveryConfirm = create<GlobalCompleteDeliveryConfirm>(
  (set) => ({
    id: 0,
    setId: (param: number) => set({ id: param }),
    isModalVisible: false,
    setIsModalVisible: (param: boolean) => set({ isModalVisible: param }),
    onAfterCompleted: () => {},
    setOnAfterCompleted: (func: () => void) => set({ onAfterCompleted: func }),
    step: 0,
    setStep: (step: number) => set({ step: step }),
    model: {} as OrderFetchModel,
    setModel: (model: OrderFetchModel) => set({ model: model }),
    title: "",
    setTitle: (title: string) => set({ title: title }),
    isShowActionale: true,
    setIsShowActionale: (param: boolean) => set({ isShowActionale: param }),
  })
);

export default useGlobalCompleteDeliveryConfirm;
