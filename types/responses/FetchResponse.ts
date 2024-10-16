import PageableModel from "../models/PageableModel";
import APICommonResponse from "./APICommonResponse";
export type FetchResponseValue<T> = PageableModel & {
  items: Array<T>;
};

type FetchResponse<T> = APICommonResponse & {
  value: FetchResponseValue<T>;
};

export type FetchOnlyListResponse<T> = APICommonResponse & {
  value: T[];
};
export default FetchResponse;
