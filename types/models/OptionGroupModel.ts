import FoodModel from "./FoodModel";
import OptionModel from "./OptionModel";

export default interface OptionGroupModel {
  id: number;
  title: string;
  isRequire: boolean;
  type: number;
  status: number;
  minChoices: number;
  maxChoices: number;
  numOfItemLinked?: number;
  options?: OptionModel[];
  foods?: FoodModel[];
}
