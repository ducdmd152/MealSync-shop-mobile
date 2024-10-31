import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { FrameDateTime } from "@/types/models/TimeModel";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import apiClient from "@/services/api-services/api-client";
import {
  DeliveryPackageGroupDetailsModel,
  DeliveryPackageGroupModel,
} from "@/types/models/DeliveryPackageModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import utilService from "@/services/util-service";
import sessionService from "@/services/session-service";
import { ScrollView } from "react-native-gesture-handler";
import CustomButton from "../custom/CustomButton";
import {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { Ionicons } from "@expo/vector-icons";
interface Props {
  query: FrameDateTime;
  onNotFound?: () => void;
  containerStyleClasses?: string;
}
const DeliveryFrameDetail = ({
  query,
  onNotFound = () => {},
  containerStyleClasses = "",
}: Props) => {
  const [gPKGDetails, setGPKGDetails] =
    useState<DeliveryPackageGroupDetailsModel>(
      {} as DeliveryPackageGroupDetailsModel
    );
  const [isLoading, setIsLoading] = useState(true);
  const getOrderDetail = async () => {
    try {
      const response = await apiClient.get<
        FetchValueResponse<DeliveryPackageGroupDetailsModel>
      >(`shop-owner/delivery-package-group`, {
        headers: {
          Authorization: `Bearer ${await sessionService.getAuthToken()}`,
        },
        params: {
          ...query,
        },
      });
      setGPKGDetails({ ...response.data.value });
    } catch (error: any) {
      console.log("ERROR: ", error);
      onNotFound();
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getOrderDetail();
  }, [query]);

  console.log(gPKGDetails);
  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-[14px] text-gray-700 italic">
          Khung giao hàng:
        </Text>
        <View className="flex-row">
          <Text className="font-psemibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
            {utilService.formatTime(query.startTime) +
              " - " +
              utilService.formatTime(query.endTime)}
          </Text>
          <Text className="ml-2 bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
            {utilService.formatDateDdMmYyyy(query.intendedRecieveDate)}
          </Text>
        </View>
      </View>
      {gPKGDetails?.deliverPackageGroup?.length && (
        <Text className="mt-2 text-[14px] text-gray-700 italic text-right">
          {gPKGDetails?.deliverPackageGroup.length} gói hàng được phân công
        </Text>
      )}
      <ScrollView style={{ flexGrow: 1 }}>
        <View className="gap-y-2 mt-[2px] ml-1">
          {gPKGDetails?.deliverPackageGroup?.map((pkg) => (
            <View
              key={pkg.deliveryPackageId}
              className="p-2 border-2 border-gray-200 rounded-md"
            >
              <View
                className={`flex-row items-center justify-between bg-gray-200 rounded-xl px-2 py-2`}
              >
                <View className="flex-row items-center gap-x-1">
                  <Image
                    source={{ uri: pkg.shopDeliveryStaff.avatarUrl }}
                    resizeMode="cover"
                    className="h-[18px] w-[18px] rounded-md opacity-85"
                  />
                  <Text>
                    {utilService.shortenName(pkg.shopDeliveryStaff.fullName)}
                    {pkg.shopDeliveryStaff.id == 0 && " (bạn)"}
                  </Text>
                </View>
                <Text className="mx-2 text-[12px]">
                  Hoàn thành {pkg.successful + pkg.failed}/{pkg.total}
                </Text>
              </View>
              {/* <Text className="text-[11.5px] text-gray-700 font-semibold">
              {utilService.shortenName(pkg.shopDeliveryStaff.fullName)}{" "}
              {pkg.shopDeliveryStaff.id == 0 && (
                <Text className="italic">{"(bạn) "}</Text>
              )}
              - {pkg.total} đơn (
              {pkg.dormitories
                .map((dorm) => `${dorm.total}${dorm.id == 1 ? "A" : "B"}`)
                .join(", ")}
              ) - Hoàn tất {pkg.successful + pkg.failed}/{pkg.total}
            </Text> */}

              <View className="mt-2 border-[1px] border-gray-100 p-1 pt-0">
                {pkg.dormitories.map((dorm) => (
                  <View key={dorm.id} className="mt-1">
                    <Text className="text-[10px]">
                      {dorm.id == 1 ? "KTX Khu A" : "KTX Khu B"} ({dorm.total}{" "}
                      đơn)
                    </Text>
                    <Text className="text-[10px] text-gray-600">
                      {dorm.delivering} đang giao | {dorm.successful} giao thành
                      công | {dorm.failed} giao thất bại | {dorm.waiting} chưa
                      giao
                    </Text>
                    <View className="border-[0.5px] border-gray-200 my-1" />
                    {pkg.orders
                      .filter((order) => order.dormitoryId == dorm.id)
                      .map((order) => (
                        <TouchableOpacity
                          key={order.id}
                          onPress={() => {
                            // setOrderDetailId(order.id);
                            // setOrder(order);
                            // setIsDetailBottomSheetVisible(true);
                          }}
                          className="p-[4px] px-[6px] bg-white border-2 border-gray-300 rounded-lg"
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                              <Text className="text-[10px] bg-gray-100 text-gray-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100">
                                MS-{order.id}
                              </Text>
                            </View>
                            <View className="flex-row gap-x-1 items-center">
                              {/* <Text className="ml-2   bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[10px] rounded ">
                                {order.dormitoryId == 1
                                  ? "Đến KTX khu A"
                                  : "Đến KTX khu B"}
                              </Text> */}
                              <Text
                                className={`text-[10px] font-medium me-2 px-2.5 py-0.5 rounded ${
                                  getOrderStatusDescription(order.status)
                                    ?.bgColor
                                }`}
                                style={{
                                  backgroundColor: getOrderStatusDescription(
                                    order.status
                                  )?.bgColor,
                                }}
                              >
                                {
                                  getOrderStatusDescription(order.status)
                                    ?.description
                                }
                              </Text>
                            </View>
                          </View>
                          <View className="flex-row justify-between items-center mt-[4px]">
                            <View className="flex-1 flex-row justify-start items-center gap-2">
                              <Image
                                source={{
                                  uri: order.foods[0].imageUrl,
                                }}
                                resizeMode="cover"
                                className="h-[12px] w-[12px] rounded-md opacity-85"
                              />
                              <Text className="text-xs italic text-gray-500">
                                {order.foods[0].name}{" "}
                                {order.foods[0].quantity > 1 &&
                                  " x" + order.foods[0].quantity}
                                {order.foods.length > 1 &&
                                  " +" + (order.foods.length - 1) + " món khác"}
                              </Text>
                            </View>
                            <View className="flex-row gap-x-1 items-center">
                              <Text
                                className={`text-[10px] font-medium me-2 px-2.5 py-1 rounded `}
                              >
                                {utilService.formatPrice(
                                  order.totalPrice - order.totalPromotion
                                )}{" "}
                                ₫
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <CustomButton
        title="Chỉnh sửa"
        //   isLoading={isSubmitting}
        handlePress={() => {
          // onSubmit();
        }}
        containerStyleClasses="mt-5 h-[40px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-psemibold z-10"
        textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
      />
    </View>
  );
};

export default DeliveryFrameDetail;
