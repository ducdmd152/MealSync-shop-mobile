import apiClient from "@/services/api-services/api-client";
import orderAPIService from "@/services/api-services/order-api-service";
import utilService from "@/services/util-service";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { ShopDeliveryStaff } from "@/types/models/StaffInfoModel";
import ValueResponse from "@/types/responses/ValueReponse";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { useToast } from "react-native-toast-notifications";
import CustomModal from "../common/CustomModal";
import OrderDeliveryInfo from "../common/OrderDeliveryInfo";
import CustomButton from "../custom/CustomButton";
import OrderDeliveryAssign from "../delivery-package/OrderDeliveryAssign";
import OrderCancelModal from "../target-modals/OrderCancelModal";
import OrderReportInfo from "../common/OrderReportInfo";
import OrderReviewInfo from "../common/OrderReviewInfo";
import dayjs from "dayjs";
import ReviewReplyModal from "../target-modals/ReviewReplyModal";
import ImageViewingModal from "../target-modals/ImageViewingModal";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import useGlobalChattingState from "@/hooks/states/useChattingState";
import Chatbox from "../realtime/Chatbox";
const formatTime = (time: number): string => {
  const hours = Math.floor(time / 100)
    .toString()
    .padStart(2, "0");
  const minutes = (time % 100).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
function maskPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.length <= 6) {
    return phoneNumber;
  }

  const start = phoneNumber.slice(0, 3);
  const end = phoneNumber.slice(-3);
  const masked = "*".repeat(phoneNumber.length - 6);

  return `${start}${masked}${end}`;
}

const formatPrice = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
};
const windowHeight = Dimensions.get("window").height;
interface Props {
  orderId: number;
  onNotFound?: () => void;
  containerStyleClasses?: string;
  innerContainerStyleClasses?: string;
  hasHeaderInfo?: boolean;
  showActionButtons?: boolean;
  order: OrderDetailModel;
  setOrder: (order: OrderDetailModel) => void;
  isModal?: boolean;
}
const OrderDetail = ({
  orderId,
  onNotFound = () => {},
  containerStyleClasses = "",
  innerContainerStyleClasses = "",

  hasHeaderInfo = false,
  showActionButtons = true,
  order,
  setOrder,
  isModal = false,
}: Props) => {
  const toast = useToast();
  // const globalOrderDetailState = useGlobalOrderDetailState();
  const [isOpenOrderAssign, setIsOpenOrderAssign] = React.useState(false);
  const globalChattingState = useGlobalChattingState();
  const { isChatBoxShow, setIsChatBoxShow } = globalChattingState;
  // const [order, setOrder] = useState<OrderDetailModel>({} as OrderDetailModel);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [isCancelModal, setIsCancelModal] = useState(false);
  const [isCancelOrReject, setIsCancelOrReject] = useState(false);
  // const [inChatTime, setInChatTime] = useState(false);

  const [request, setRequest] = useState<
    (reason: string, setIsSubmitting: (value: boolean) => void) => void
  >((reason: string) => {});

  const getOrderDetail = async (isRefetching = false) => {
    if (isRefetching) setIsReloading(true);
    setIsLoading(true);
    try {
      const response = await apiClient.get<ValueResponse<OrderDetailModel>>(
        `shop-owner/order/${orderId}`
      );
      setOrder({ ...response.data.value });
      // console.log("{ ...response.data.value }: ", { ...response.data.value })
    } catch (error: any) {
      // console.log("ERROR: ", error);
      onNotFound();
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
  };
  useEffect(() => {
    getOrderDetail();
  }, []);
  // useEffect(() => {
  //   if (order?.id) {
  //     setInChatTime(
  //       order.status >= OrderStatus.Preparing &&
  //         utilService.getInChatTime(
  //           order.startTime,
  //           order.endTime,
  //           order.intendedReceiveDate
  //         )
  //     );
  //   }
  // }, [order]);
  const handleCancel = (orderId: number) => {
    const inTime = utilService.getInFrameTime(
      order.startTime,
      order.endTime,
      order.intendedReceiveDate
    );
    if (inTime > 0) {
      getOrderDetail();
      Alert.alert("Oops!", "Đã quá thời gian để thực hiện thao tác này!");
      return false;
    }

    const cancelRequest = (
      reason: string,
      setIsSubmitting: (value: boolean) => void
    ) => {
      if (reason.trim().length == 0) {
        Alert.alert("Oops", "Vui lòng điền lí do!");
        return;
      }
      setIsSubmitting(true);
      orderAPIService.cancel(
        orderId,
        reason,
        () => {
          const toast = Toast.show({
            type: "info",
            text1: `MS-${orderId}`,
            text2: `Đã hủy đơn hàng MS-${orderId}!`,
          });
          setOrder({
            ...order,
            status: OrderStatus.Cancelled,
          });
          getOrderDetail();
          setIsCancelModal(false);
          setIsSubmitting(false);
        },
        (warningInfo: WarningMessageValue) => {
          setIsSubmitting(false);
          Alert.alert(
            "Xác nhận",
            warningInfo?.message ||
              `Đơn hàng MS-${orderId} đã gần đến giờ đi giao (<=1h), bạn sẽ bị đánh cảnh cáo nếu tiếp tục hủy?`,
            [
              {
                text: "Không",
                // style: "cancel",
              },
              {
                text: "Xác nhận hủy",
                onPress: async () => {
                  setIsSubmitting(true);
                  orderAPIService.cancel(
                    orderId,
                    reason,
                    () => {
                      const toast = Toast.show({
                        type: "info",
                        text1: `MS-${orderId}`,
                        text2: `Đã hủy đơn hàng MS-${orderId}!`,
                      });
                      setOrder({
                        ...order,
                        status: OrderStatus.Cancelled,
                      });
                      getOrderDetail();
                      setIsCancelModal(false);
                      setIsSubmitting(false);
                    },
                    (warningInfo: WarningMessageValue) => {},
                    (error: any) => {
                      Alert.alert(
                        "Oops!",
                        error?.response?.data?.error?.message ||
                          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                      );
                      setIsSubmitting(false);
                    },
                    true
                  );
                },
              },
            ]
          );
        },
        (error: any) => {
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!"
          );
          setIsSubmitting(false);
        },
        false
      );
    };
    setRequest(() => cancelRequest);
    setIsCancelModal(true);
    setIsCancelOrReject(true);

    // Alert.alert(
    //   "Xác nhận",
    //   `Bạn chắc chắn hủy đơn hàng MS-${orderId} không?`,
    //   [
    //     {
    //       text: "Không",
    //       // style: "cancel",
    //     },
    //     {
    //       text: "Xác nhận hủy",
    //       onPress: async () => {

    //       },
    //     },
    //   ]
    // );
  };
  const handleReject = (orderId: number) => {
    const inTime = utilService.getInFrameTime(
      order.startTime,
      order.endTime,
      order.intendedReceiveDate
    );
    if (inTime > 0) {
      getOrderDetail();
      Alert.alert("Oops!", "Đã quá thời gian để thực hiện thao tác này!");
      return false;
    }

    const rejectRequest = (
      reason: string,
      setIsSubmitting: (value: boolean) => void
    ) => {
      if (reason.trim().length == 0) {
        Alert.alert("Oops", "Vui lòng điền lí do!");
        return;
      }
      setIsSubmitting(true);
      orderAPIService.reject(
        orderId,
        reason,
        () => {
          const toast = Toast.show({
            type: "info",
            text1: `MS-${orderId}`,
            text2: `Đã từ chối đơn hàng MS-${orderId}!`,
          });
          // toast.show(
          //   `Đã từ chối đơn hàng MS-${orderId}!`,
          //   {
          //     type: "info",
          //     duration: 1500,
          //   }
          // );
          setOrder({
            ...order,
            status: OrderStatus.Rejected,
          });
          getOrderDetail();
          setIsCancelModal(false);
          setIsSubmitting(false);
        },
        (warningInfo: WarningMessageValue) => {},
        (error: any) => {
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!"
          );
          setIsSubmitting(false);
        }
      );
    };
    setRequest(() => rejectRequest);
    setIsCancelModal(true);
    setIsCancelOrReject(false);
  };
  return (
    <>
      <View
        className={`flex-1 items-center justify-center w-full bg-[#f4f4f5] ${containerStyleClasses}`}
        style={{ backgroundColor: order?.id ? "#f4f4f5" : "#fff" }}
      >
        {order?.id == undefined && (
          <ActivityIndicator animating={true} color="#FCF450" />
        )}
        {order?.id != undefined && (
          <View className="w-full h-full">
            {hasHeaderInfo && (
              <View className="pt-4 px-2 gap-y-1 pb-1 mb-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[12.5px] text-gray-800 font-semibold mt-1">
                    Đơn hàng MS-{order.id}
                  </Text>
                  <View className="flex-row gap-x-1 items-center">
                    <Text className="ml-2 text-[11px]  font-semibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 rounded">
                      {formatTime(order.startTime) +
                        " - " +
                        formatTime(order.endTime)}
                    </Text>
                    <Text
                      className={`text-[11px] font-medium me-2 px-2.5 py-[2px] rounded ${
                        getOrderStatusDescription(order.status)?.bgColor
                      }`}
                      style={{
                        backgroundColor: getOrderStatusDescription(order.status)
                          ?.bgColor,
                      }}
                    >
                      {getOrderStatusDescription(order.status)?.description}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text className="text-[10px] text-gray-500 italic text-right">
                    Được đặt vào{" "}
                    {dayjs(order.orderDate).local().format("HH:mm DD/MM/YYYY")}
                  </Text>
                </View>
              </View>
            )}
            <ScrollView
              className={`flex-1 ${innerContainerStyleClasses}`}
              refreshControl={
                <RefreshControl
                  tintColor={"#FCF450"}
                  refreshing={isReloading}
                  onRefresh={() => {
                    getOrderDetail(true);
                  }}
                />
              }
            >
              <View className="bg-white p-2">
                <Text className="text-[15px] text-gray-600 font-semibold text-[#0891b2]">
                  Thông tin nhận hàng
                </Text>
                <View className="mt-3 border-gray-300 border-[0.5px]" />
                <View className="py-2">
                  <View className="flex-row items-between justify-center">
                    <Text className="flex-1 text-[14px] text-gray-700 font-semibold">
                      {order.customer.fullName}
                    </Text>
                    {order.status >= OrderStatus.Preparing && (
                      <TouchableOpacity
                        onPress={() => {
                          // if (
                          //   !utilService.getInChatTime(
                          //     order.startTime,
                          //     order.endTime,
                          //     order.intendedReceiveDate
                          //   )
                          // ) {
                          //   Alert.alert(
                          //     "Oops",
                          //     "Đã quá thời gian để nhắn tin."
                          //   );
                          //   setInChatTime(false);
                          //   return;
                          // }
                          // if (isModal) {
                          //   globalChattingState.setChannelId(order.id);
                          //   setIsChatBoxShow(true);
                          // } else {
                          //   globalChattingState.setChannelId(order.id);
                          //   router.push(`/chats/${order.id}`);
                          // }
                          globalChattingState.setChannelId(order.id);
                          setIsChatBoxShow(true);
                        }}
                        className="flex-row gap-x-1 mt-1 bg-[#227B94] border-[#227B94] border-0 rounded-md items-start justify-center px-[6px] bg-white "
                      >
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={17}
                          color="#227B94"
                        />
                        <Text className="text-[12.5px] text-white text-[#227B94] font-semibold">
                          Nhắn tin
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {order.status >= OrderStatus.Preparing &&
                  order.status <= OrderStatus.Completed ? (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          "Số điện thoại",
                          undefined,
                          [
                            {
                              text: "Gọi " + order.customer?.phoneNumber,
                              onPress: () =>
                                Linking.openURL(
                                  `tel:${order.customer?.phoneNumber}`
                                ),
                            },
                            {
                              text: "Sao chép",
                              onPress: () =>
                                Clipboard.setString(
                                  order.customer?.phoneNumber || ""
                                ),
                            },
                            { text: "Hủy" },
                          ].reverse()
                        );
                      }}
                    >
                      <Text className="text-[14px] text-gray-700 font-semibold text-[#0e7490]">
                        {order.customer?.phoneNumber}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text className="text-[14px] text-gray-700 font-semibold">
                      {utilService.maskPhoneNumber(order.customer.phoneNumber)}
                    </Text>
                  )}

                  <Text className="text-[14px] text-gray-700 font-semibold italic">
                    {order.buildingName}
                  </Text>
                </View>
                <View className="mt-1 border-gray-300 border-[0.3px]" />
                <View className="py-2 ">
                  <Text className="text-[14px] text-gray-700">
                    Khung nhận hàng:
                  </Text>
                  <Text className="text-[14px] text-gray-700 font-semibold">
                    {utilService.formatDateDdMmYyyy(order.intendedReceiveDate) +
                      " | " +
                      formatTime(order.startTime) +
                      " - " +
                      formatTime(order.endTime)}
                  </Text>
                </View>
              </View>
              <View className="mt-4 bg-white p-2">
                <Text className="text-[15px] text-gray-600 font-semibold text-[#0891b2]">
                  Chi tiết đơn hàng
                </Text>
                <View className="mt-3 border-gray-300 border-[0.5px]" />
                <View className="pt-4 gap-y-2">
                  {order.orderDetails.map((detail) => (
                    <View key={detail.id}>
                      <View className="flex-row justify-between">
                        <View className="flex-row gap-x-2">
                          <Text className="font-semibold w-[28px]">
                            x{detail.quantity}
                          </Text>
                          <Text className="font-semibold">{detail.name}</Text>
                        </View>
                        <View>
                          <Text className="font-semibold">
                            {formatPrice(detail.totalPrice)}₫
                          </Text>
                        </View>
                      </View>

                      {detail.optionGroups.length > 0 && (
                        <View className="flex-row gap-x-2">
                          <Text className="w-[28px]"></Text>
                          {detail.optionGroups.map((option) => (
                            <Text
                              className="italic font-gray-500 text-[12.5px]"
                              key={detail.id + option.optionGroupTitle}
                            >
                              {option.optionGroupTitle}:{" "}
                              {option.options
                                .map((item) => item.optionTitle)
                                .join(", ")}
                              {" ; "}
                            </Text>
                          ))}
                        </View>
                      )}

                      {detail.note && (
                        <View className="flex-row gap-x-2 mt-[2px]">
                          <Text className="w-[28px]"></Text>
                          <Text className="italic font-gray-500 text-[12.5px]">
                            Ghi chú: {detail.note}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
              <View className="mt-1 bg-white p-2">
                <Text className="text-[14px] text-gray-500 font-semibold">
                  Ghi chú cho toàn đơn hàng
                </Text>
                <View className="mt-2 border-gray-300 border-[0.5px]" />
                <Text className="mt-2 italic text-gray-5\600  text-[14px]">
                  {order.note || "Không có"}
                </Text>
              </View>
              <View className="mt-2 bg-white p-2 bg-[#fffbeb]">
                <View className="py-2 gap-y-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[14px] text-gray-700 ">
                      Tổng tạm tính
                    </Text>
                    <Text className="text-[14px] text-gray-700 font-semibold">
                      {formatPrice(order.totalPrice)} ₫
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between ">
                    <Text className="text-[14px] text-gray-700 ">
                      Khuyến mãi
                    </Text>
                    <Text className="text-[14px] text-gray-700 font-semibold">
                      {order.totalPromotion > 0 && "-"}
                      {formatPrice(order.totalPromotion)} ₫
                    </Text>
                  </View>
                </View>
                <View className="mt-1 border-gray-300 border-[0.3px]" />
                <View className="py-2 flex-row items-center justify-between ">
                  <Text className="text-[15px] text-gray-700 font-semibold">
                    Tổng tiền:
                  </Text>
                  <Text className="text-[15px] text-gray-700 font-semibold">
                    {formatPrice(order.totalPrice - order.totalPromotion)} ₫
                  </Text>
                </View>
                {order.isCustomerPaid ? (
                  <Text className="text-right text-md font-bold text-green-500 mb-1">
                    Đã thanh toán
                  </Text>
                ) : (
                  <Text className="text-right text-md font-bold text-gray-800 mb-1">
                    Chưa thanh toán
                  </Text>
                )}
              </View>

              {order.shopDeliveryStaff && (
                <View className="mt-2 bg-white p-2">
                  <OrderDeliveryInfo
                    order={order}
                    containerStyleClasses={"py-2 bg-blue-100 p-2 mx-[-8px] "}
                    textNameStyleClasses={`text-[13.5px]`}
                    avatarStyleClasses={`h-[17px] w-[17px] mr-[2px]`}
                    assignNode={
                      // order.shopDeliveryStaff != null &&
                      // globalCompleteDeliveryConfirm.isShowActionale &&
                      // order.status <= OrderStatus.Delivering &&
                      // authRole == 2 &&
                      // inFrameTime == 0 ? (
                      //   <TouchableOpacity
                      //     onPress={() => {
                      //       if (!actionInTimeValidation(true)) return;
                      //       setIsOpenOrderAssign(true);
                      //     }}
                      //   >
                      //     <Text className="p-[0.5] my-[-1] text-[11px] font-medium text-[#0891b2]">
                      //       Thay đổi
                      //     </Text>
                      //   </TouchableOpacity>
                      // ) : (
                      <View></View>
                      // )
                    }
                  />
                </View>
              )}

              {(order.status == OrderStatus.IssueReported ||
                order.status == OrderStatus.UnderReview ||
                order.status == OrderStatus.Resolved) && (
                <OrderReportInfo order={order} isLoading={isLoading} />
              )}
              {order.status >= OrderStatus.Delivered && (
                <OrderReviewInfo order={order} isLoading={isLoading} />
              )}
            </ScrollView>
            {showActionButtons && (
              <View
                className={`items-center justify-center bg-white pt-2 ${innerContainerStyleClasses}`}
              >
                {order.status == OrderStatus.Pending &&
                  utilService.getInFrameTime(
                    order.startTime,
                    order.endTime,
                    order.intendedReceiveDate
                  ) <= 0 && (
                    <View className="flex-row items-center gap-x-1">
                      <TouchableOpacity
                        className="flex-1 bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-lg items-center justify-center px-[6px] py-[10px]"
                        onPress={() => {
                          const inTime = utilService.getInFrameTime(
                            order.startTime,
                            order.endTime,
                            order.intendedReceiveDate
                          );
                          if (inTime > 0) {
                            getOrderDetail();
                            Alert.alert(
                              "Oops!",
                              "Đã quá thời gian để thực hiện thao tác này!"
                            );
                            return false;
                          }
                          Alert.alert(
                            "Xác nhận",
                            `Xác nhận đơn hàng MS-${order.id}?`,
                            [
                              {
                                text: "Đồng ý",
                                onPress: async () => {
                                  orderAPIService.confirm(
                                    order.id,
                                    () => {
                                      const toast = Toast.show({
                                        type: "info",
                                        text1: `MS-${order.id}`,
                                        text2: `Đơn hàng MS-${order.id} đã được xác nhận!`,
                                      });
                                      // toast.show(
                                      //   `Đơn hàng MS-${order.id} đã được xác nhận!`,
                                      //   {
                                      //     type: "info",
                                      //     duration: 1500,
                                      //   }
                                      // );
                                      // Alert.alert(
                                      //   "Hoàn tất",
                                      //   `Đơn hàng MS-${order.id} đã được xác nhận!`
                                      // );
                                      setOrder({
                                        ...order,
                                        status: OrderStatus.Confirmed,
                                      });
                                      getOrderDetail();
                                    },
                                    (warningInfo: WarningMessageValue) => {},
                                    (error: any) => {
                                      Alert.alert(
                                        "Oops!",
                                        error?.response?.data?.error?.message ||
                                          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                                      );
                                    }
                                  );
                                },
                              },
                              {
                                text: "Hủy",
                              },
                            ]
                          );
                        }}
                      >
                        <Text className="text-[16px] font-semibold">
                          Nhận đơn
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 bg-white border-[#fda4af] bg-[#fda4af] border-2 rounded-lg items-center justify-center px-[6px] py-[10px]"
                        onPress={() => handleReject(order.id)}
                      >
                        <Text className="text-[16px] font-semibold">
                          Từ chối
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                {order.status == OrderStatus.Confirmed &&
                  utilService.getInFrameTime(
                    order.startTime,
                    order.endTime,
                    order.intendedReceiveDate
                  ) <= 0 && (
                    <View className="flex-row items-center gap-x-1">
                      <TouchableOpacity
                        className="flex-1 bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-lg items-center justify-center px-[6px] py-[10px]"
                        onPress={() => {
                          const inTime = utilService.getInFrameTime(
                            order.startTime,
                            order.endTime,
                            order.intendedReceiveDate
                          );
                          if (inTime > 0) {
                            getOrderDetail();
                            Alert.alert(
                              "Oops!",
                              "Đã quá thời gian để thực hiện thao tác này!"
                            );
                            return false;
                          }
                          Alert.alert(
                            "Xác nhận",
                            `Bắt đầu chuẩn bị đơn hàng MS-${order.id}?`,
                            [
                              {
                                text: "Đồng ý",
                                onPress: async () => {
                                  orderAPIService.prepare(
                                    order.id,
                                    () => {
                                      const toast = Toast.show({
                                        type: "info",
                                        text1: `MS-${order.id}`,
                                        text2: `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`,
                                      });
                                      // toast.show(
                                      //   `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`,
                                      //   {
                                      //     type: "info",
                                      //     duration: 1500,
                                      //   }
                                      // );
                                      // Alert.alert(
                                      //   "Hoàn tất",
                                      //   `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`
                                      // );
                                      setOrder({
                                        ...order,
                                        status: OrderStatus.Preparing,
                                      });
                                      getOrderDetail();
                                    },
                                    (warningInfo: WarningMessageValue) => {
                                      Alert.alert(
                                        "Xác nhận",
                                        warningInfo.message,
                                        [
                                          {
                                            text: "Đồng ý",
                                            onPress: async () => {
                                              orderAPIService.prepare(
                                                order.id,
                                                () => {
                                                  const toast = Toast.show({
                                                    type: "info",
                                                    text1: `MS-${order.id}`,
                                                    text2: `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`,
                                                  });
                                                  // toast.show(
                                                  //   `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`,
                                                  //   {
                                                  //     type: "info",
                                                  //     duration: 1500,
                                                  //   }
                                                  // );
                                                  // Alert.alert(
                                                  //   "Hoàn tất",
                                                  //   `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`
                                                  // );
                                                  setOrder({
                                                    ...order,
                                                    status:
                                                      OrderStatus.Preparing,
                                                  });
                                                  getOrderDetail();
                                                },
                                                (
                                                  warningInfo: WarningMessageValue
                                                ) => {},
                                                (error: any) => {
                                                  Alert.alert(
                                                    "Oops!",
                                                    error?.response?.data?.error
                                                      ?.message ||
                                                      "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                                                  );
                                                },
                                                true
                                              );
                                            },
                                          },
                                          {
                                            text: "Hủy",
                                          },
                                        ]
                                      );
                                    },
                                    (error: any) => {
                                      Alert.alert(
                                        "Oops!",
                                        error?.response?.data?.error?.message ||
                                          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                                      );
                                    },
                                    false
                                  );
                                },
                              },
                              {
                                text: "Hủy",
                              },
                            ]
                          );
                        }}
                      >
                        <Text className="text-[15px] font-semibold">
                          Chuẩn bị
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleCancel(order.id)}
                        className="flex-1 bg-white border-[#e2e8f0] bg-[#e2e8f0] border-2 rounded-lg items-center justify-center px-[6px] py-[10px]"
                      >
                        <Text className="text-[15px] font-medium">Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                {order.status == OrderStatus.Preparing &&
                  utilService.getInFrameTime(
                    order.startTime,
                    order.endTime,
                    order.intendedReceiveDate
                  ) <= 0 && (
                    <View className="flex-row items-center gap-x-1">
                      <TouchableOpacity
                        onPress={() => {
                          const inTime = utilService.getInFrameTime(
                            order.startTime,
                            order.endTime,
                            order.intendedReceiveDate
                          );
                          if (inTime > 0) {
                            getOrderDetail();
                            Alert.alert(
                              "Oops!",
                              "Đã quá thời gian để thực hiện thao tác này!"
                            );
                            return false;
                          }
                          // globalOrderDetailState.setId(order.id);
                          // globalOrderDetailState.setIsActionsShowing(true);
                          setOrder(order);
                          setIsOpenOrderAssign(true);
                        }}
                        // className="bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                        // className="bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                        className="flex-1 bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-lg items-center justify-center px-[6px] py-[10px]"
                      >
                        <Text className="text-[15px] font-semibold">
                          {order.shopDeliveryStaff
                            ? "Thay đổi người giao"
                            : "Chọn người giao hàng"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                {/* <TouchableOpacity
                    onPress={() => {}}
                    className="bg-white border-[#227B94] border-[1px] rounded-md items-center justify-center px-[6px] py-[0px]"
                  >
                    <Text className="text-[13.5px]">Chi tiết</Text>
                  </TouchableOpacity> */}

                {/* {order.status == OrderStatus.Delivering && (
                <View className="w-full flex-row gap-x-2 items-center justify-between pt-3 px-2 bg-white mr-[-8px]">
                  <CustomButton
                    title="Giao thành công"
                    handlePress={() => {}}
                    containerStyleClasses="flex-1 h-[44px] px-4 bg-transparent border-0 border-gray-200 bg-[#4ade80] font-semibold z-10"
                    // iconLeft={
                    //   <Ionicons name="filter-outline" size={21} color="white" />
                    // }
                    textStyleClasses="text-[13.5px] text-gray-900 ml-1 text-white text-gray-800"
                  />
                  <CustomButton
                    title="Không thành công"
                    handlePress={() => {}}
                    containerStyleClasses="flex-1 h-[44px] px-4 bg-transparent border-0 border-gray-200 bg-[#fda4af] font-semibold z-10 ml-1 "
                    textStyleClasses="text-[13.5px] text-gray-900 ml-1 text-white text-gray-700"
                  />
                </View>
              )} */}
              </View>
            )}
          </View>
        )}
        <CustomModal
          title={``}
          hasHeader={false}
          isOpen={isOpenOrderAssign}
          setIsOpen={(value) => setIsOpenOrderAssign(value)}
          titleStyleClasses="text-center flex-1"
          containerStyleClasses="w-[98%]"
          onBackdropPress={() => {
            setIsOpenOrderAssign(false);
          }}
        >
          <OrderDeliveryAssign
            onComplete={(shopDeliveryStaff) => {
              setIsOpenOrderAssign(false);
              getOrderDetail();
              if (shopDeliveryStaff === null) {
                return;
              }
              Toast.show({
                type: "info",
                text1: `MS-${order.id}`,
                text2: `Đơn hàng MS-${order.id} sẽ được giao bởi ${
                  shopDeliveryStaff.id == 0 ? "bạn" : shopDeliveryStaff.fullName
                }!`,
              });
              // toast.show(
              //   `Đơn hàng MS-${order.id} sẽ được giao bởi ${
              //     shopDeliveryStaff.id == 0 ? "bạn" : shopDeliveryStaff.fullName
              //   }!`,
              //   {
              //     type: "success",
              //     duration: 3000,
              //   }
              // );
            }}
            order={order}
            isNeedForReconfimation={order.shopDeliveryStaff ? false : true}
          />
        </CustomModal>
        <OrderCancelModal
          isCancelOrReject={isCancelOrReject}
          orderId={order.id}
          request={request}
          isOpen={isCancelModal}
          setIsOpen={setIsCancelModal}
        />
        <ReviewReplyModal />
        <ImageViewingModal />
        <Toast topOffset={-20} />
      </View>
      <CustomModal
        title={``}
        hasHeader={false}
        isOpen={isChatBoxShow}
        setIsOpen={(value) => setIsChatBoxShow(value)}
        titleStyleClasses="text-center flex-1"
        containerStyleClasses="h-screen w-screen p-0 pt-3"
        onBackdropPress={() => {
          setIsChatBoxShow(false);
        }}
      >
        <Chatbox
          channelId={globalChattingState.channelId}
          onBack={() => setIsChatBoxShow(false)}
        />
      </CustomModal>
    </>
  );
};

export default OrderDetail;
