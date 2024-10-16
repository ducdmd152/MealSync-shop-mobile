import FoodModel from "./FoodModel";

export interface ShopCategoryModel {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  displayOrder: number;
  foods?: FoodModel[];
}
