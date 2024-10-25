import APICommonResponse from "./APICommonResponse";
import { FetchResponseValue } from "./FetchResponse";

export interface WarningMessageValue {
  message: string;
  code: string;
}

type WarningMessageRespone = APICommonResponse & {
  value: WarningMessageValue;
};
export default WarningMessageRespone;
