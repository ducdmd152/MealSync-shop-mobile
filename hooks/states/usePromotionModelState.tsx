import FoodDetailModel from "@/types/models/FoodDetailModel";
import OptionGroupModel from "@/types/models/OptionGroupModel";
import PromotionModel from "@/types/models/PromotionModel";
import { ShopCategoryModel } from "@/types/models/ShopCategoryModel";
import { Href } from "expo-router";
import { create } from "zustand";

interface PromotionModelState {
  promotion: PromotionModel;
  setPromotion: (promotion: PromotionModel) => void;
}

const usePromotionModelState = create<PromotionModelState>((set) => ({
  promotion: {} as PromotionModel,
  setPromotion: (item: PromotionModel) => set({ promotion: item }),
}));

export default usePromotionModelState;
