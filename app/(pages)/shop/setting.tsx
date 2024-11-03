import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import React, { useState } from "react";
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
import { BottomSheet } from "@rneui/themed";
import CustomButton from "@/components/custom/CustomButton";
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
const detailBottomHeight = Dimensions.get("window").height - 100;
const Setting = () => {
  (async () => {
    console.log(await sessionService.getAuthToken());
  })();
  const [isSwitchOn, setIsSwitchOn] = React.useState(true);
  const [
    isOperatingSlotSettingBottomSheetVisible,
    setIsOperatingSlotSettingBottomSheetVisible,
  ] = useState(false);
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
  const operatingSlotSetting = (
    <View
      className={`p-4 bg-white rounded-t-lg bottom-0 h-max`}
      style={{
        maxHeight: detailBottomHeight,
        height: shopProfile.data?.value.operatingSlots?.length
          ? Math.max(
              (shopProfile.data?.value.operatingSlots?.length || 0) * 100 + 50,
              200
            )
          : 240,
      }}
    >
      <TouchableOpacity
        className="items-center"
        onPress={() => setIsOperatingSlotSettingBottomSheetVisible(false)}
      >
        <Ionicons name="chevron-down-outline" size={24} color="gray" />
      </TouchableOpacity>
      <View className="flex-1 mt-3">
        <Text className="text-md text-gray-800 text-center mb-4">
          Các khoảng thời gian hoạt động trong ngày
        </Text>
        {!shopProfile.data?.value.operatingSlots.length && (
          <Text className="text-[11px] italic text-gray-700 text-center ">
            Chưa có bất kì khoảng hoạt động nào
          </Text>
        )}
        <View className="justify-stretch">
          {shopProfile.data?.value.operatingSlots.map((slot, index) => (
            <View key={slot.id} className="w-full">
              <View className="border-2 p-2 border-gray-200 rounded flex-row items-center justify-center">
                <Text className="text-[16px] italic text-gray-800 text-center flex-1">
                  {slot.title} : {slot.timeSlot}
                </Text>
                <View className="mx-2 flex-row items-center">
                  <TouchableOpacity>
                    <Ionicons name="create-outline" size={24} color="#227B94" />
                  </TouchableOpacity>
                  <TouchableOpacity className="ml-1">
                    <Ionicons name="trash-outline" size={22} color="#FF9001" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* {index !=
            shopProfile.data?.value.operatingSlots.length - 1 && (
            <View className="h-[1px] bg-gray-200 mt-2 mb-2" />
          )} */}
            </View>
          ))}
        </View>
      </View>
      <CustomButton
        title="Thêm mới"
        containerStyleClasses="mt-5 bg-white border-2 border-secondary-100  h-[40px]"
        textStyleClasses="text-white text-sm text-secondary-100"
        iconLeft={
          <View className="mr-1">
            <Ionicons name="add-circle-outline" size={16} color="#FF9001" />
          </View>
        }
        handlePress={() => {
          // setIsOperatingSlotSettingBottomSheetVisible(false);
        }}
      />
    </View>
  );
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
              onPress={() => {
                shopProfile.refetch();
                setIsOperatingSlotSettingBottomSheetVisible(true);
              }}
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
      <BottomSheet
        containerStyle={{
          zIndex: 11,
        }}
        modalProps={{}}
        isVisible={isOperatingSlotSettingBottomSheetVisible}
      >
        {operatingSlotSetting}
      </BottomSheet>
    </PageLayoutWrapper>
  );
};

export default Setting;
