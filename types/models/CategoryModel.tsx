import FoodModel from "./FoodModel";

export interface CategoryModel {
  id?: number;
  categoryId?: number;
  categoryName: string;
  foods: FoodModel[];
}
