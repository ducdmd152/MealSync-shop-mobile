import {
  DeliveryPackageModel,
  OwnDeliveryPackageModel,
} from "@/types/models/DeliveryPackageModel";
import { filterStatuses, OrderStatus } from "@/types/models/OrderFetchModel";

import { create } from "zustand";
interface GlobalPKGDetailsState {
  isDetailsModalVisible: boolean;
  setIsDetailsModalVisible: (param: boolean) => void;
  model: OwnDeliveryPackageModel;
  setModel: (param: OwnDeliveryPackageModel) => void;
  onAfterCompleted: () => void;
  setOnAfterCompleted: (func: () => void) => void;
}

const useGlobalMyPKGDetailsState = create<GlobalPKGDetailsState>((set) => ({
  isDetailsModalVisible: false,
  setIsDetailsModalVisible: (param: boolean) =>
    set({ isDetailsModalVisible: param }),
  model: {} as OwnDeliveryPackageModel,
  setModel: (param: OwnDeliveryPackageModel) => set({ model: param }),
  onAfterCompleted: () => {},
  setOnAfterCompleted: (func: () => void) => set({ onAfterCompleted: func }),
}));

export default useGlobalMyPKGDetailsState;
