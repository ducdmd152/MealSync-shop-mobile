import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FrameDateTime } from "@/types/models/TimeModel";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import apiClient from "@/services/api-services/api-client";
import {
  DeliveryPackageGroupDetailsModel,
  DeliveryPackageGroupModel,
  OwnDeliveryPackageModel,
} from "@/types/models/DeliveryPackageModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import utilService from "@/services/util-service";
import sessionService from "@/services/session-service";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import CustomButton from "../custom/CustomButton";
import OrderFetchModel, {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { Ionicons } from "@expo/vector-icons";
import { boolean } from "yup";
import {
  ActivityIndicator,
  Portal,
  Modal as ModalPaper,
} from "react-native-paper";
import OrderDeliveryAssign from "./OrderDeliveryAssign";
import { ShopDeliveryStaff } from "@/types/models/StaffInfoModel";
import { router, useFocusEffect } from "expo-router";
import useGPKGState from "@/hooks/states/useGPKGState";
import useGlobalOrderDetailState from "@/hooks/states/useGlobalOrderDetailState";
import useGlobalPKGDetailsState from "@/hooks/states/useGlobalPKGDetailsState";
interface Props {
  onNotFound?: () => void;
  containerStyleClasses?: string;
  onClose: () => void;
}
const initExtend = false;
const detailBottomHeight = Dimensions.get("window").height - 220;
const DeliveryPKGDetail = ({
  onNotFound = () => {},
  containerStyleClasses = "",
  onClose,
}: Props) => {
  const globalPKGState = useGlobalPKGDetailsState();
  const { model: pkgDetails, setModel: setPKGDetails } = globalPKGState;
  const [extendPKGs, setExtendPKGs] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderFetchModel>({} as OrderFetchModel);
  const [isOpenOrderAssign, setIsOpenOrderAssign] = React.useState(false);
  const globalOrderDetailState = useGlobalOrderDetailState();
  const getPKGDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<
        FetchValueResponse<OwnDeliveryPackageModel>
      >(
        `shop-owner-staff/delivery-package/` +
          globalPKGState.model.deliveryPackageId
      );
      setPKGDetails({ ...response.data.value });
    } catch (error: any) {
      onNotFound();
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getPKGDetails();
    }, [])
  );

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center">
          <Text className="font-semibold bg-gray-100 text-gray-600 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100 text-[11px]">
            PKG-{pkgDetails.deliveryPackageId}
          </Text>
        </View>
        <View className="flex-row">
          <Text className="font-semibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
            {utilService.formatTime(pkgDetails.startTime || 1000) +
              " - " +
              utilService.formatTime(pkgDetails.endTime || 1030)}
          </Text>
          <Text className="ml-2 bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
            {/* {utilService.formatDateDdMmYyyy(query.intendedReceiveDate)} */}
          </Text>
        </View>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={"#FCF450"}
            refreshing={isLoading}
            onRefresh={() => {
              getPKGDetails();
            }}
          />
        }
      >
        <View
          className="gap-y-2 mt-[2px] ml-1"
          style={{
            minHeight: detailBottomHeight,
          }}
        >
          <View
            key={pkgDetails.deliveryPackageId}
            className="p-2 border-2 border-gray-200 rounded-md"
          >
            <View className="flex-row items-center gap-x-1">
              <Image
                source={{ uri: pkgDetails.shopDeliveryStaff.avatarUrl }}
                resizeMode="cover"
                className="h-[18px] w-[18px] rounded-md opacity-85"
              />
              <Text>
                {utilService.shortenName(pkgDetails.shopDeliveryStaff.fullName)}
                {pkgDetails.shopDeliveryStaff.id == 0 && " (bạn)"}
              </Text>
            </View>
            <View className="flex-row items-center gap-x-1">
              <Text className="mx-2 text-[12px]">
                Hoàn thành {pkgDetails.successful + pkgDetails.failed}/
                {pkgDetails.total}
              </Text>
            </View>

            <View className="mt-2 border-[1px] border-gray-100 p-1 pt-0">
              {pkgDetails.dormitories.map((dorm) => (
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
                  {pkgDetails.orders
                    .filter((order) => order.dormitoryId == dorm.id)
                    .map((order) => (
                      <TouchableOpacity
                        key={order.id}
                        onPress={() => {
                          // globalOrderDetailState.setId(order.id);
                          // globalOrderDetailState.setIsActionsShowing(true);
                          // globalOrderDetailState.setIsDetailBottomSheetVisible(
                          //   true
                          // );
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
                                getOrderStatusDescription(order.status)?.bgColor
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
        </View>
      </ScrollView>
    </View>
  );
};

export default DeliveryPKGDetail;
