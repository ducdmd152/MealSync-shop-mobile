import FoodModel from "./FoodModel";

export interface CategoryModel {
  id: number;
  name: string;
  foods: FoodModel[];
}
