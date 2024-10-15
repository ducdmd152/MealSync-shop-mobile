import TestModel from "../../types/models/TestModel";
import apiClient from "./api-client";
import createHttpService from "./api-service";

export const endpoints = {
  TEST: "https://my-json-server.typicode.com/duckodei/test-json-server/list/",
  FOOD_LIST: "shop-owner/food",
};

export const testApiService = createHttpService<TestModel>(
  apiClient,
  endpoints.TEST
);
