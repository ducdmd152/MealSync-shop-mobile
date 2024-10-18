import FoodDetailModel from "@/types/models/FoodDetailModel";
import OptionGroupModel from "@/types/models/OptionGroupModel";
import { ShopCategoryModel } from "@/types/models/ShopCategoryModel";
import { Href } from "expo-router";
import { create } from "zustand";

interface ModelState {
  foodDetailModel: FoodDetailModel;
  setFoodDetailModel: (foodDetailModel: FoodDetailModel) => void;
  optionGroupModel: OptionGroupModel;
  setOptionGroupModel: (optionGroupModel: OptionGroupModel) => void;
  shopCategoryModel: ShopCategoryModel;
  setShopCategoryModel: (shopCategoryModel: ShopCategoryModel) => void;
}

const useModelState = create<ModelState>((set) => ({
  foodDetailModel: {} as FoodDetailModel,
  optionGroupModel: {} as OptionGroupModel,
  shopCategoryModel: {} as ShopCategoryModel,
  setFoodDetailModel: (value: FoodDetailModel) =>
    set({ foodDetailModel: value }),
  setOptionGroupModel: (value: OptionGroupModel) =>
    set({ optionGroupModel: value }),
  setShopCategoryModel: (value: ShopCategoryModel) =>
    set({ shopCategoryModel: value }),
}));

export default useModelState;
