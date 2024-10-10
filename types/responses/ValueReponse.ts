import APICommonResponse from "./APICommonResponse";

type ValueResponse<T> = APICommonResponse & {
  value: T;
};

export default ValueResponse;
