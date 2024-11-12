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
  ORDER_LIST: "shop-owner/order",
  FRAME_STAFF_INFO_LIST: "shop/shop-delivery-staff/available",
  UNCREATED_GPKG_FRAME_LIST: "shop-owner/delivery-package/time-frame/un-assign",
  DELIVERY_PACKAGE_GROUP_LIST: "shop-owner/delivery-package-group/interval",
  MY_DELIVERY_PACKAGE_LIST: "shop-owner-staff/delivery-package",

  SHOP_PROFILE_FULL_INFO: "shop-owner/full-infor",
  PROMOTION_LIST: "shop-owner/promotion",
  HOME_STATISTICS: "shop-owner/order/statistics/summary",
  SHOP_STATISTICS: "shop-owner/order/statistics",
  REVIEWS: "shop-onwer/review",
  WITHDRAWAL_LIST: "shop-owner/withdrawal/history",
  EXTERNAL_BANK_LIST: "https://api.vietqr.io/v2/banks",
  BALANCE: "shop-owner/wallet/summary",
  WALLET_TRANSACTIONS: "shop-owner/walet-transaction",
  STAFF_LIST: "shop-owner/delivery-staff",
  STORAGE_FILE_UPLOAD: "storage/file/upload",
  STORAGE_FILE_DELETE: "storage/file/delete",
  SHOP_LOGO_UPDATE: "shop-owner/logo/update",
  ACCOUNT_AVATAR_UPDATE: "shop-owner/avatar/update",
};

export const testApiService = createHttpService<TestModel>(
  apiClient,
  endpoints.TEST
);
