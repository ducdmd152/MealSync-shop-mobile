import FoodDetailModel from "@/types/models/FoodDetailModel";
import { Href } from "expo-router";
import { create } from "zustand";

interface ModelState {
  foodDetailModel: FoodDetailModel;
  setFoodDetailModel: (foodDetailModel: FoodDetailModel) => void;
}

const useModelState = create<ModelState>((set) => ({
  foodDetailModel: {} as FoodDetailModel,
  setFoodDetailModel: (value: FoodDetailModel) =>
    set({ foodDetailModel: value }),
}));

export default useModelState;
