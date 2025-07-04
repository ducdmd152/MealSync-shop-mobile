import useGlobalCompleteDeliveryConfirm from "@/hooks/states/useGlobalCompleteDeliveryConfirm";
import useGlobalOrderDetailState from "@/hooks/states/useGlobalOrderDetailState";
import useGlobalPKGDetailsState from "@/hooks/states/useGlobalPKGDetailsState";
import apiClient from "@/services/api-services/api-client";
import orderUIService from "@/services/order-ui-service";
import utilService from "@/services/util-service";
import {
  DeliveryPackageEstimateInfoModel,
  DeliveryPackageStatus,
  OwnDeliveryPackageModel,
} from "@/types/models/DeliveryPackageModel";
import OrderFetchModel, {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Toast from "react-native-toast-message";
import { useToast } from "react-native-toast-notifications";
import CompleteDeliveryConfirmModal from "../target-modals/CompleteDeliveryConfirmModal";
import CustomButton from "../custom/CustomButton";
import OrderMultiSelectToDelivery from "./OrderMultiSelectToDelivery";
import CustomModal from "../common/CustomModal";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";

interface Props {
  onNotFound?: () => void;
  containerStyleClasses?: string;
  onClose: () => void;
}
const initExtend = false;
const detailBottomHeight = Dimensions.get("window").height - 150;
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
  const [isReLoading, setIsReLoading] = useState(false);
  const [order, setOrder] = useState<OrderFetchModel>({} as OrderFetchModel);
  const [isOpenOrderAssign, setIsOpenOrderAssign] = React.useState(false);
  const globalOrderDetailState = useGlobalOrderDetailState();
  const [orders, setOrders] = useState<OrderFetchModel[]>([]);
  const [status, setStatus] = useState(0);
  const [refreshing, setIsRefreshing] = useState(false);
  const globalCompleteDeliveryConfirm = useGlobalCompleteDeliveryConfirm();
  const [isNotFound, setIsNotFound] = useState(false);
  const [isMultiSelectToDelivery, setIsMultiSelectToDelivery] = useState(false);

  const getPKGDetails = async (isFirstTime = false) => {
    // console.log("getPKGDetails nề?: " + isFirstTime);
    setIsLoading(true);
    if (!isFirstTime) setIsReLoading(true);
    try {
      const response = await apiClient.get<
        FetchValueResponse<OwnDeliveryPackageModel>
      >(
        `shop-owner-staff/delivery-package/` +
          globalPKGState.model.deliveryPackageId
      );
      setPKGDetails({ ...response.data.value });
      setIsNotFound(false);
    } catch (error: any) {
      setIsNotFound(true);
      globalPKGState.onAfterCompleted();
    } finally {
      setIsLoading(false);
      setIsReLoading(false);
      globalPKGState.onAfterCompleted();
    }
  };
  const packageDeliveryEstimateFetcher = useFetchWithRQWithFetchFunc(
    ["web/shop-owner/delivery-package/calculate-time-suggest"],
    async (): Promise<FetchValueResponse<DeliveryPackageEstimateInfoModel>> =>
      apiClient
        .get(
          "web/shop-owner/delivery-package/calculate-time-suggest" +
            `?${pkgDetails.orders
              .map((order) => `orderIds=${order.id}`)
              .join("&")}`,
          {
            params: {
              intendedReceiveDate: pkgDetails.intendedReceiveDate,
              startTime: pkgDetails.startTime,
              endTime: pkgDetails.endTime,
            },
          }
        )
        .then((response) => response.data),
    []
  );
  useEffect(() => {
    if (!isLoading) {
      setOrders(
        (pkgDetails?.orders || []).sort((a, b) => {
          return a.dormitoryId - b.dormitoryId;
        })
      );
    }
  }, [pkgDetails?.orders]);

  useFocusEffect(
    useCallback(() => {
      packageDeliveryEstimateFetcher.refetch();
      getPKGDetails(false);
    }, [])
  );

  const filteredOrders = () => {
    if (status == 0) return orders;
    if (status == DeliveryPackageStatus.Pending)
      return orders.filter((order) => order.status < OrderStatus.Delivering);
    if (status == DeliveryPackageStatus.OnGoing)
      return orders.filter((order) => order.status == OrderStatus.Delivering);
    if (status == DeliveryPackageStatus.Completed)
      return orders.filter((order) => order.status > OrderStatus.Delivering);

    return orders;
  };

  return (
    <View className="flex-1">
      {!isNotFound && (
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center">
            <Text className="font-semibold bg-gray-100 text-gray-600 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100 text-[11px]">
              PKG-{pkgDetails.deliveryPackageId}
            </Text>
          </View>
          <View className="flex-row">
            <Text className="font-semibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
              {utilService.formatTime(pkgDetails.startTime) +
                " - " +
                utilService.formatTime(pkgDetails.endTime)}
            </Text>
            <Text className="ml-2 bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
              {dayjs(pkgDetails.deliveryDate).local().format("DD/MM/YYYY")}
            </Text>
          </View>
        </View>
      )}

      {!isNotFound && (
        <View className="mt-3 w-full flex-row items-center justify-between pb-2">
          <TouchableOpacity
            className={`flex-1 mx-[2px] bg-gray-100 rounded-lg px-2 py-2   ${
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
            className={`flex-1 mx-[2px] bg-gray-100 rounded-lg px-2 py-2   ${
              status == DeliveryPackageStatus.Pending
                ? "bg-secondary"
                : "bg-gray-100"
            }`}
            onPress={() => {
              setStatus(DeliveryPackageStatus.Pending);
            }}
          >
            <Text className="text-center text-[12px]">
              Chưa giao{"\n"}({pkgDetails.waiting} đơn)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 mx-[2px] bg-gray-100 rounded-lg px-2 py-2   ${
              status == DeliveryPackageStatus.OnGoing
                ? "bg-secondary"
                : "bg-gray-100"
            }`}
            onPress={() => {
              setStatus(DeliveryPackageStatus.OnGoing);
            }}
          >
            <Text className="text-center text-[12px]">
              Đang giao{"\n"}({pkgDetails.delivering} đơn)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 mx-[2px] bg-gray-100 rounded-lg px-2 py-2   ${
              status == DeliveryPackageStatus.Completed
                ? "bg-secondary"
                : "bg-gray-100"
            }`}
            onPress={() => {
              setStatus(DeliveryPackageStatus.Completed);
            }}
          >
            <Text className="text-center text-[12px]">
              Hoàn tất{"\n"}({pkgDetails.successful + pkgDetails.failed} đơn)
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {!isNotFound && packageDeliveryEstimateFetcher.isSuccess && (
        <View className="ml-1">
          <Text className="italic text-orange-600 text-[10px]">
            Hãy xuất phát trước{" "}
            {utilService.formatTime(
              packageDeliveryEstimateFetcher.data?.value
                .suggestStartTimeDelivery || 0
            )}{" "}
            để hoàn tất gói hàng đúng giờ.
          </Text>
          <Text className="italic text-orange-600 text-[10px]">
            Gói giao này mất khoảng{" "}
            {
              packageDeliveryEstimateFetcher.data?.value
                .totalMinutesHandleDelivery
            }{" "}
            phút để hoàn tất (bao gồm việc di chuyển)
          </Text>
        </View>
      )}
      {isNotFound && (
        <Text className="font-semibold bg-gray-100 text-gray-600 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100 text-[14px] p-4 text-center">
          Gói giao PKG-{globalPKGState.model.deliveryPackageId} không còn tồn
          tại.
        </Text>
      )}
      {!isNotFound && (
        <ScrollView
          style={{ flexShrink: 1 }}
          refreshControl={
            <RefreshControl
              tintColor={"#FCF450"}
              refreshing={refreshing}
              onRefresh={() => {
                getPKGDetails(false);
                setIsRefreshing(true);
                setTimeout(() => {
                  setIsRefreshing(false);
                }, 1000);
              }}
            />
          }
        >
          <View
            className="gap-y-2 mt-[2px] ml-1 "
            style={{
              minHeight: detailBottomHeight,
            }}
          >
            {pkgDetails.dormitories &&
              pkgDetails.dormitories.map((dorm) => (
                <View
                  key={dorm.id}
                  className="mt-1 border-gray-100 border-[1px] p-2 rounded-md"
                >
                  <Text className="text-[15px]">
                    {dorm.id == 1 ? "KTX Khu A" : "KTX Khu B"} ({dorm.total}{" "}
                    đơn)
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
                          globalCompleteDeliveryConfirm.setIsShowActionale(
                            true
                          );
                          globalCompleteDeliveryConfirm.setId(order.id);
                          globalCompleteDeliveryConfirm.setOnAfterCompleted(
                            () => {
                              getPKGDetails();
                            }
                          );
                          globalCompleteDeliveryConfirm.setIsModalVisible(true);
                          globalCompleteDeliveryConfirm.setModel(order);
                          globalCompleteDeliveryConfirm.setStep(0);
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
                              {
                                getOrderStatusDescription(order.status)
                                  ?.description
                              }
                            </Text>
                            {order.status == OrderStatus.Preparing &&
                              utilService.getInDeliveryTime(
                                order.startTime,
                                order.endTime,
                                order.intendedReceiveDate
                              ) == 0 && (
                                <TouchableOpacity
                                  onPress={() => {
                                    orderUIService.onDelivery(
                                      order,
                                      () => {
                                        getPKGDetails();
                                      },
                                      () => {
                                        setOrders(
                                          orders.map((item) =>
                                            item.id != order.id
                                              ? item
                                              : {
                                                  ...order,
                                                  status:
                                                    OrderStatus.Delivering,
                                                }
                                          )
                                        );
                                        getPKGDetails();
                                        const toast = Toast.show({
                                          type: "info",
                                          text1: "Hoàn tất",
                                          text2: `MS-${order.id} đã chuyển sang trạng thái giao hàng`,
                                        });
                                      },
                                      (error) => {
                                        Alert.alert(
                                          "Oops!",
                                          error?.response?.data?.error
                                            ?.message ||
                                            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                                        );
                                        getPKGDetails();
                                      }
                                    );
                                  }}
                                  className={` flex-row items-center rounded-md items-center justify-center px-[8px] py-[2.2px] bg-[#227B94]`}
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

                            {order.status == OrderStatus.Delivering &&
                              utilService.getInFrameTime(
                                order.startTime,
                                order.endTime,
                                order.intendedReceiveDate
                              ) == 0 && (
                                <TouchableOpacity
                                  onPress={async () => {
                                    globalCompleteDeliveryConfirm.setIsShowActionale(
                                      true
                                    );

                                    globalCompleteDeliveryConfirm.setId(
                                      order.id
                                    );
                                    globalCompleteDeliveryConfirm.setOnAfterCompleted(
                                      () => {
                                        getPKGDetails();
                                      }
                                    );
                                    globalCompleteDeliveryConfirm.setIsModalVisible(
                                      true
                                    );
                                    globalCompleteDeliveryConfirm.setModel(
                                      order
                                    );
                                    globalCompleteDeliveryConfirm.setStep(0);
                                  }}
                                  className={` flex-row items-center rounded-md items-center justify-center px-[8px] py-[2.2px] bg-[#227B94]`}
                                >
                                  <Text className="text-[12px] text-white mr-1 text-center">
                                    Xác nhận giao
                                  </Text>
                                  {/* <Ionicons
                                name="send-outline"
                                size={12}
                                color="white"
                              /> */}
                                </TouchableOpacity>
                              )}
                          </View>
                        </View>
                        <View className="flex-row justify-between items-center mt-[4px]">
                          <View className="flex-1 flex-row justify-start items-center gap-2">
                            <Image
                              source={{
                                uri: order.orderDetails[0].imageUrl,
                              }}
                              resizeMode="cover"
                              className="h-[12px] w-[12px] rounded-md opacity-85"
                            />
                            <Text className="text-xs italic text-gray-500">
                              {order.orderDetailSummaryShort}
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
      )}
      <CustomModal
        title="Tiến hành đi giao"
        hasHeader={false}
        isOpen={isMultiSelectToDelivery}
        setIsOpen={(value) => {
          setIsMultiSelectToDelivery(value);
        }}
        titleStyleClasses="text-center flex-1 font-bold text-[14px]"
        containerStyleClasses="w-[90%]"
        onBackdropPress={() => {
          setIsMultiSelectToDelivery(false);
        }}
      >
        <OrderMultiSelectToDelivery
          orders={orders.filter(
            (order) => order.status == OrderStatus.Preparing
          )}
          startTime={pkgDetails.startTime}
          endTime={pkgDetails.endTime}
          intendedReceiveDate={pkgDetails.intendedReceiveDate}
          onRefetch={() => getPKGDetails()}
          exit={() => setIsMultiSelectToDelivery(false)}
          onSuccess={() => {
            getPKGDetails();
            Toast.show({
              type: "info",
              text1: "Hoàn tất",
              text2: `Các đơn được chọn đã chuyển sang trạng thái giao hàng`,
            });
            setIsMultiSelectToDelivery(false);
          }}
          onError={(error) => {
            if (
              error.response &&
              (error.response.status == 500 ||
                error.response.status == 501 ||
                error.response.status == 502)
            ) {
              Alert.alert(
                "Oops!",
                error?.response?.data?.error?.message ||
                  "Xử lí bị gián đoạn, vui lòng thử lại!"
              );
            } else
              Alert.alert(
                "Oops!",
                error?.response?.data?.error?.message ||
                  "Yêu cầu bị từ chối, vui lòng thử lại sau!"
              );
          }}
        />
      </CustomModal>
      {utilService.getInDeliveryTime(
        pkgDetails.startTime,
        pkgDetails.endTime,
        pkgDetails.intendedReceiveDate
      ) == 0 && (
        <CustomButton
          title="Đi giao"
          //   isLoading={isSubmitting}
          handlePress={() => {
            if (
              utilService.getInDeliveryTime(
                pkgDetails.startTime,
                pkgDetails.endTime,
                pkgDetails.intendedReceiveDate
              ) > 0
            ) {
              getPKGDetails();
              Alert.alert("Oops!", "Đã quá thời gian đi giao!");
              return;
            }
            getPKGDetails();
            setIsMultiSelectToDelivery(true);
          }}
          containerStyleClasses="mt-5 h-[40px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold"
          textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
        />
      )}
      <Toast position="bottom" />
      <CompleteDeliveryConfirmModal />
    </View>
  );
};

export default DeliveryPKGDetail;
