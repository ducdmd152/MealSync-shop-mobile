export default interface FoodModel {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  isSoldOut: boolean;
  status: number;
}
export enum FoodStatus {
  Active = 1,
  UnActive = 2,
  Deleted = 3,
}
