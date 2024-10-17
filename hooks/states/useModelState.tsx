import FoodDetailModel from "@/types/models/FoodDetailModel";
import OptionGroupModel from "@/types/models/OptionGroupModel";
import { Href } from "expo-router";
import { create } from "zustand";

interface ModelState {
  foodDetailModel: FoodDetailModel;
  setFoodDetailModel: (foodDetailModel: FoodDetailModel) => void;
  optionGroupModel: OptionGroupModel;
  setOptionGroupModel: (optionGroupModel: OptionGroupModel) => void;
}

const useModelState = create<ModelState>((set) => ({
  foodDetailModel: {} as FoodDetailModel,
  optionGroupModel: {} as OptionGroupModel,
  setFoodDetailModel: (value: FoodDetailModel) =>
    set({ foodDetailModel: value }),
  setOptionGroupModel: (value: OptionGroupModel) =>
    set({ optionGroupModel: value }),
}));

export default useModelState;
