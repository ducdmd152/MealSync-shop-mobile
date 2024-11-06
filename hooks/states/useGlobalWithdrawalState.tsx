import FoodDetailModel from "@/types/models/FoodDetailModel";
import OptionGroupModel from "@/types/models/OptionGroupModel";
import { ShopCategoryModel } from "@/types/models/ShopCategoryModel";
import {
  WITHDRAW_STATUSES_FILTER,
  WithdrawalModel,
  WithdrawalStatus,
} from "@/types/models/WithdrawalModel";
import dayjs, { Dayjs } from "dayjs";
import { Href } from "expo-router";
import { create } from "zustand";

interface GlobalWithdrawalState {
  statuses: WithdrawalStatus[];
  setStatuses: (statuses: WithdrawalStatus[]) => void;
  withdrawal: WithdrawalModel;
  setWithdrawal: (withdrawal: WithdrawalModel) => void;
  startDate: Dayjs;
  endDate: Dayjs;
  setStartDate: (date: Dayjs) => void;
  setEndDate: (date: Dayjs) => void;
}

const useGlobalWithdrawalState = create<GlobalWithdrawalState>((set) => ({
  statuses: WITHDRAW_STATUSES_FILTER[0].value,
  setStatuses: (statuses: WithdrawalStatus[]) => set({ statuses: statuses }),
  withdrawal: {} as WithdrawalModel,
  setWithdrawal: (item: WithdrawalModel) => set({ withdrawal: item }),
  startDate: dayjs(dayjs("2024-01-01")),
  endDate: dayjs(Date.now()),
  setStartDate: (date: Dayjs) => set({ startDate: date }),
  setEndDate: (date: Dayjs) => set({ endDate: date }),
}));

export default useGlobalWithdrawalState;
