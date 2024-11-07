import FoodDetailModel from "@/types/models/FoodDetailModel";
import OptionGroupModel from "@/types/models/OptionGroupModel";
import PromotionModel from "@/types/models/PromotionModel";
import { ShopCategoryModel } from "@/types/models/ShopCategoryModel";
import dayjs, { Dayjs } from "dayjs";
import { Href } from "expo-router";
import { create } from "zustand";

interface PromotionModelState {
  promotion: PromotionModel;
  setPromotion: (promotion: PromotionModel) => void;
  startDate: Dayjs;
  endDate: Dayjs;
  setStartDate: (date: Dayjs) => void;
  setEndDate: (date: Dayjs) => void;
}

const usePromotionModelState = create<PromotionModelState>((set) => ({
  promotion: {} as PromotionModel,
  setPromotion: (item: PromotionModel) => set({ promotion: item }),
  startDate: dayjs(dayjs("2024-01-01")),
  endDate: dayjs(dayjs("2024-12-31")),
  setStartDate: (date: Dayjs) => set({ startDate: date }),
  setEndDate: (date: Dayjs) => set({ endDate: date }),
}));

export default usePromotionModelState;
