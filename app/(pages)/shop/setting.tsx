import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Avatar, Switch } from "react-native-paper";
import sessionService from "@/services/session-service";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { ShopProfileGetModel } from "@/types/models/ShopProfileModel";
import { useFocusEffect } from "expo-router";
function formatTimeRanges(timeRanges: string[]): string {
  const length = timeRanges.length;

  if (length <= 3) {
    // Join all elements with " | " for lists with 3 or fewer elements
    return timeRanges.join(" | ");
  } else if (length === 4) {
    // Insert a newline between the first two and last two elements for a list with 4 elements
    return `${timeRanges.slice(0, 2).join(" | ")}\n${timeRanges
      .slice(2)
      .join(" | ")}`;
  } else {
    // For lists with more than 4 elements, group by three elements per line
    let formattedString = "";
    for (let i = 0; i < length; i += 3) {
      formattedString += timeRanges.slice(i, i + 3).join(" | ");
      if (i + 3 < length) {
        formattedString += "\n";
      }
    }
    return formattedString;
  }
}
const Setting = () => {
  (async () => {
    console.log(await sessionService.getAuthToken());
  })();
  const [isSwitchOn, setIsSwitchOn] = React.useState(true);
  const onSwitchStatus = () => () => {};
  const onToggleIsOvernight = () => {};
  const onToggleIsAutoconfirm = () => {};

  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.FRAME_STAFF_INFO_LIST.concat(["gpkg-create-page"]),
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    []
  );

  useFocusEffect(
    React.useCallback(() => {
      shopProfile.refetch();
    }, [])
  );

  const getShopStatusDescription = (
    status: number,
    isReceivingOrderPaused: boolean
  ) => {
    if (status === 0) return "";
    if (status == 1) return "Chưa được phê duyệt";
    if (status == 3) return "Tạm đóng cửa hàng";
    if (isReceivingOrderPaused) return "Tạm ngưng nhận hàng";
    if (status == 2) return "Đang mở bán";
  };

  return (
    <PageLayoutWrapper>
      <View className="p-4 gap-y-8">
        <View className="">
          <TouchableOpacity className="flex-row justify-between items-center gap-x-2 pb-4">
            <View className="flex-row justify-start items-center gap-x-2">
              <Avatar.Image
                size={48}
                source={{
                  uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV5-FEuyxb-HMUB41PwAEX_yopAjz0KgMAbg&s",
                }}
              />
              <View className="gap-y-0">
                <Text className="text-lg italic text-gray text-primary font-medium mb-[-4px]">
                  Tiệm ăn tháng năm
                </Text>
                <Text className="text-[11px] italic text-gray text-primary font-medium ">
                  {getShopStatusDescription(
                    shopProfile.data?.value.status
                      ? shopProfile.data?.value.status
                      : 0,
                    shopProfile.data?.value.isReceivingOrderPaused || false
                  )}
                </Text>
              </View>
            </View>
            {shopProfile.isFetching ? (
              <ActivityIndicator animating={true} color="#FCF450" />
            ) : (
              <View className="scale-100">
                <Switch
                  color="#e95137"
                  value={
                    shopProfile.data?.value.status == 2 &&
                    shopProfile.data?.value.isReceivingOrderPaused == false
                  }
                  onValueChange={onToggleIsOvernight}
                  disabled={shopProfile.isRefetching}
                />
              </View>
            )}
          </TouchableOpacity>
          <View className="border-b-2 border-gray-300"></View>
        </View>

        <View className="">
          <Text className="font-psemibold text-gray-600">
            THỜI GIAN HOẠT ĐỘNG
          </Text>
          <View className="text-gray-700">
            <TouchableOpacity
              onPress={() => {}}
              className="flex-row p-1 justify-between items-center mt-1"
            >
              <View className="flex-row gap-x-2">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                {shopProfile.isLoading && (
                  <ActivityIndicator animating={true} color="#FCF450" />
                )}

                <Text className={`font-psemibold text-md text-gray-600`}>
                  {formatTimeRanges(
                    (shopProfile.data?.value.operatingSlots || []).map(
                      (slot) => slot.timeSlot
                    )
                  )}
                </Text>
              </View>
              <Ionicons size={20} name="chevron-forward-outline" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="">
          <Text className="font-psemibold text-gray-600">ĐẶT HÀNG QUA ĐÊM</Text>
          <View className="text-gray-700">
            <TouchableOpacity
              onPress={() => {}}
              className="flex-row p-1 justify-between items-center mt-1"
            >
              <View className="flex-row gap-x-2">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                <Text className={`font-medium text-md text-gray-600`}>
                  Cho phép đặt hàng vào ngày mai
                </Text>
              </View>
              {shopProfile.isLoading ? (
                <ActivityIndicator animating={true} color="#FCF450" />
              ) : (
                <View className="scale-75">
                  <Switch
                    color="#e95137"
                    value={shopProfile.data?.value.isAcceptingOrderNextDay}
                    onValueChange={onToggleIsOvernight}
                    disabled={shopProfile.isRefetching}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="">
          <Text className="font-psemibold text-gray-600">
            TỰ ĐỘNG XÁC NHẬN ĐƠN HÀNG
          </Text>
          <View className="text-gray-700">
            {shopProfile.isFetching ? (
              <ActivityIndicator animating={true} color="#FCF450" />
            ) : (
              <TouchableOpacity className="flex-row p-1 justify-between items-center mt-1">
                <View className="flex-row gap-x-2 flex-1">
                  {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                  <Text className={`font-medium italic text-md text-gray-600`}>
                    {shopProfile.data?.value.isAutoOrderConfirmation
                      ? "Đang bật tự động xác nhận đơn"
                      : "Đã tắt tự động xác nhận đơn"}
                  </Text>
                </View>

                <View className="scale-75 ml-2">
                  <Switch
                    color="#e95137"
                    value={shopProfile.data?.value.isAutoOrderConfirmation}
                    onValueChange={onToggleIsAutoconfirm}
                    disabled={shopProfile.isRefetching}
                  />
                </View>
              </TouchableOpacity>
            )}
            {!shopProfile.isFetching &&
              shopProfile.data?.value.isAutoOrderConfirmation && (
                <TouchableOpacity className="flex-row p-1 justify-between items-center mt-1">
                  <View className="flex-row gap-x-2 flex-1">
                    {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                    <Text
                      className={`font-medium italic text-md text-gray-600`}
                    >
                      {shopProfile.data?.value.maxOrderHoursInAdvance}
                      Tự động xác nhận đơn hàng trong khoảng trước{" "}
                      {shopProfile.data?.value.maxOrderHoursInAdvance}h đến{" "}
                      {shopProfile.data?.value.minOrderHoursInAdvance}h trước
                      khung giao hàng
                    </Text>
                  </View>
                  <View className="ml-2">
                    <Ionicons size={20} name="chevron-forward-outline" />
                  </View>
                </TouchableOpacity>
              )}
            <TouchableOpacity
              onPress={() => {}}
              className="flex-row p-1 justify-between items-center mt-1"
            >
              <View className="flex-row gap-x-2 flex-1">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                <Text
                  className={`font-medium italic text-[12px] text-gray-600`}
                >
                  Lưu ý: tính năng này chỉ hoạt động trong thời gian hoạt động
                  của cửa hàng
                </Text>
              </View>
              <View className="ml-2">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default Setting;
