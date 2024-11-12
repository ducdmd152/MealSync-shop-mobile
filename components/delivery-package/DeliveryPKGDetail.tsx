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
  DeliveryPackageStatus,
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
import {
  ShopDeliveryStaff,
  ShopDeliveryStaffStatus,
} from "@/types/models/StaffInfoModel";
import { router, useFocusEffect } from "expo-router";
import useGPKGState from "@/hooks/states/useGPKGState";
import useGlobalOrderDetailState from "@/hooks/states/useGlobalOrderDetailState";
import useGlobalPKGDetailsState from "@/hooks/states/useGlobalPKGDetailsState";
import DeliveryPackage from "@/app/(tabs)/delivery-package";
import dayjs from "dayjs";
import orderAPIService from "@/services/api-services/order-api-service";
import { useToast } from "react-native-toast-notifications";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
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
  const toast = useToast();
  const globalPKGState = useGlobalPKGDetailsState();
  const { model: pkgDetails, setModel: setPKGDetails } = globalPKGState;
  const [extendPKGs, setExtendPKGs] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderFetchModel>({} as OrderFetchModel);
  const [isOpenOrderAssign, setIsOpenOrderAssign] = React.useState(false);
  const globalOrderDetailState = useGlobalOrderDetailState();
  const [status, setStatus] = useState(0);
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

  const onDelivering = (orderIds: number[], isConfirm = false) => {
    orderAPIService.delivery(
      orderIds,
      () => {
        toast.show(
          orderIds.length == 1
            ? `Đơn hàng MS-${orderIds[0]} đã được chuyển sang trạng thái giao hàng`
            : `Chuyển sang trạng thái giao hàng thành công`,
          {
            type: "success",
            duration: 2000,
          }
        );
      },
      (warningInfo: WarningMessageValue) => {
        if (isConfirm) return;
        Alert.alert("Xác nhận", warningInfo.message, [
          {
            text: "Xác nhận",
            onPress: async () => {
              onDelivering(orderIds, true);
            },
          },
          {
            text: "Hủy",
          },
        ]);
      },
      (error: any) => {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
        );
      }
    );
  };
  const filteredOrders = () => {
    if (status == 0) return pkgDetails.orders;
    if (status == DeliveryPackageStatus.Pending)
      return pkgDetails.orders.filter(
        (order) => order.status < OrderStatus.Delivering
      );
    if (status == DeliveryPackageStatus.OnGoing)
      return pkgDetails.orders.filter(
        (order) => order.status == OrderStatus.Delivering
      );
    if (status == DeliveryPackageStatus.Completed)
      return pkgDetails.orders.filter(
        (order) => order.status > OrderStatus.Delivering
      );

    return pkgDetails.orders;
  };
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
            {dayjs(pkgDetails.deliveryDate).local().format("DD/MM/YYYY")}
          </Text>
        </View>
      </View>
      <View className="mt-3 w-full flex-row items-center justify-between pb-2">
        <TouchableOpacity
          className={`flex-1 mx-[2px] bg-gray-100 rounded-lg px-3 py-2   ${
            status == 0 ? "bg-secondary" : "bg-gray-100"
          }`}
          onPress={() => {
            setStatus(0);
          }}
        >
          <Text className="text-center text-[12px]">
            Tất cả {"\n"}({pkgDetails.total} đơn)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 mx-[2px] bg-gray-100 rounded-lg px-3 py-2   ${
            status == DeliveryPackageStatus.Pending
              ? "bg-secondary"
              : "bg-gray-100"
          }`}
          onPress={() => {
            setStatus(DeliveryPackageStatus.Pending);
          }}
        >
          <Text className="text-center text-[12px]">
            Chưa giao ({pkgDetails.waiting} đơn)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 mx-[2px] bg-gray-100 rounded-lg px-3 py-2   ${
            status == DeliveryPackageStatus.OnGoing
              ? "bg-secondary"
              : "bg-gray-100"
          }`}
          onPress={() => {
            setStatus(DeliveryPackageStatus.OnGoing);
          }}
        >
          <Text className="text-center text-[12px]">
            Đang giao ({pkgDetails.delivering} đơn)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 mx-[2px] bg-gray-100 rounded-lg px-3 py-2   ${
            status == DeliveryPackageStatus.Completed
              ? "bg-secondary"
              : "bg-gray-100"
          }`}
          onPress={() => {
            setStatus(DeliveryPackageStatus.Completed);
          }}
        >
          <Text className="text-center text-[12px]">
            Hoàn tất ({pkgDetails.successful + pkgDetails.failed} đơn)
          </Text>
        </TouchableOpacity>
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
          {pkgDetails.dormitories.map((dorm) => (
            <View
              key={dorm.id}
              className="mt-1 border-gray-100 border-[1px] p-2 rounded-md"
            >
              <Text className="text-[15px]">
                {dorm.id == 1 ? "KTX Khu A" : "KTX Khu B"} ({dorm.total} đơn)
              </Text>
              <Text className="text-[12px] text-gray-600">
                {dorm.delivering} đang giao | {dorm.successful} đã giao |{" "}
                {dorm.failed} giao thất bại | {dorm.waiting} chưa giao
              </Text>
              <View className="border-[0.5px] border-gray-200 my-1" />
              {filteredOrders()
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
                    className="mt-1 p-[4px] px-[6px] bg-white border-2 border-gray-300 rounded-lg"
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
                          {getOrderStatusDescription(order.status)?.description}
                        </Text>
                        {order.status == OrderStatus.Preparing &&
                          !utilService.isCurrentTimeGreaterThanEndTime({
                            startTime: pkgDetails.startTime,
                            endTime: pkgDetails.endTime,
                            intendedReceiveDate: pkgDetails.deliveryDate,
                          }) && (
                            <TouchableOpacity
                              onPress={() => {
                                if (
                                  utilService.isCurrentTimeGreaterThanEndTime({
                                    startTime: pkgDetails.startTime,
                                    endTime: pkgDetails.endTime,
                                    intendedReceiveDate:
                                      pkgDetails.deliveryDate,
                                  })
                                ) {
                                  Alert.alert(
                                    "Oops!",
                                    "Đã quá thời gian đi giao!"
                                  );

                                  return;
                                }

                                Alert.alert(
                                  "Xác nhận",
                                  `Chuyển đơn MS-${order.id} sang trạng thái giao hàng?`,
                                  [
                                    {
                                      text: "Xác nhận",
                                      onPress: async () => {
                                        onDelivering([order.id]);
                                      },
                                    },
                                    {
                                      text: "Hủy",
                                    },
                                  ]
                                );
                              }}
                              className={` flex-row items-center rounded-md items-center justify-center px-[8px] py-[2.2px] bg-[#227B94]`}
                              disabled={order.status != OrderStatus.Preparing}
                            >
                              <Text className="text-[12px] text-white mr-1 text-center">
                                Đi giao
                              </Text>
                              <Ionicons
                                name="send-outline"
                                size={12}
                                color="white"
                              />
                            </TouchableOpacity>
                          )}
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
      </ScrollView>
    </View>
  );
};

export default DeliveryPKGDetail;
