import TestModel from "../../types/models/TestModel";
import apiClient from "./api-client";
import createHttpService from "./api-service";

export const endpoints = {
  TEST: "https://my-json-server.typicode.com/duckodei/test-json-server/list/",
  FOOD_LIST: "shop-owner/food",
  SHOP_CATEGORY_LIST: "shop-owner/category",
  PLATFORM_CATEGORY_LIST: "platform-category",
  OPTION_GROUP_LIST: "shop-owner/option-group",
  OPERATING_SLOT_LIST: "shop-owner/operating-slot",
};

export const testApiService = createHttpService<TestModel>(
  apiClient,
  endpoints.TEST
);
