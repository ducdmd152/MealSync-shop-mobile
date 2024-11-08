import { View, Text, Dimensions, ScrollView, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import apiClient from "@/services/api-services/api-client";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import ValueResponse from "@/types/responses/ValueReponse";
import { ActivityIndicator } from "react-native-paper";
import {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import CustomButton from "../custom/CustomButton";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import orderAPIService from "@/services/api-services/order-api-service";
import { RefreshControl } from "react-native-gesture-handler";
import useGlobalOrderDetailState from "@/hooks/states/useGlobalOrderDetailState";
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
const formatDate = (dateString: string): string => {
  const date = new Date(dateString.replace(/\//g, "-"));
  return date.toLocaleDateString("en-GB");
};
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
}
const OrderDetail = ({
  orderId,
  onNotFound = () => {},
  containerStyleClasses = "",
}: Props) => {
  const globalOrderDetailState = useGlobalOrderDetailState();
  const [order, setOrder] = useState<OrderDetailModel>({} as OrderDetailModel);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const getOrderDetail = async (isRefetching = false) => {
    if (isRefetching) setIsReloading(true);
    try {
      const response = await apiClient.get<ValueResponse<OrderDetailModel>>(
        `shop-owner/order/${orderId}`
      );
      setOrder({ ...response.data.value });
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

  return (
    <View
      className={`items-center justify-center w-full bg-[#f4f4f5] pt-2 ${containerStyleClasses}`}
    >
      {isLoading ? (
        <ActivityIndicator color="#FCF450" />
      ) : (
        <View className="w-full h-full">
          <View className="px-2 gap-y-3 pb-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-[12.5px] text-gray-800 font-semibold mt-1">
                Đơn hàng MS-{order.id}
              </Text>
              <View className="flex-row gap-x-1 items-center">
                <Text className="ml-2  font-semibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[10px] rounded">
                  {formatTime(order.startTime) +
                    " - " +
                    formatTime(order.endTime)}
                </Text>
                <Text
                  className={`text-[10px] font-medium me-2 px-2.5 py-1 rounded ${
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
                {new Date(order.orderDate).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                {new Date(order.orderDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl
                tintColor={"#FCF450"}
                refreshing={isReloading}
                onRefresh={() => {
                  getOrderDetail();
                }}
              />
            }
          >
            <View className="mt-2 bg-white p-2">
              <Text className="text-[15px] text-gray-600 font-semibold">
                Thông tin nhận hàng
              </Text>
              <View className="mt-3 border-gray-300 border-[0.5px]" />
              <View className="py-2">
                <Text className="text-[14px] text-gray-700 font-semibold">
                  {order.customer.fullName}
                </Text>
                <Text className="text-[14px] text-gray-700 font-semibold">
                  {maskPhoneNumber(order.customer.phoneNumber)}
                </Text>
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
                  {formatDate(order.intendedReceiveDate) +
                    " | " +
                    formatTime(order.startTime) +
                    " - " +
                    formatTime(order.endTime)}
                </Text>
              </View>
            </View>
            <View className="mt-4 bg-white p-2">
              <Text className="text-[15px] text-gray-600 font-semibold">
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

                    <View className="flex-row gap-x-2">
                      <Text className="w-[28px]"></Text>
                      {detail.optionGroups.map((option) => (
                        <Text
                          className="italic font-gray-500 text-[12px]"
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
                    <View className="flex-row gap-x-2 mt-[2px]">
                      <Text className="w-[28px]"></Text>
                      <Text className="italic font-gray-500 text-[12px]">
                        Ghi chú: ...
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View className="mt-2 bg-white p-2">
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
                  <Text className="text-[14px] text-gray-700 ">Khuyến mãi</Text>
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
            </View>

            <View className="mt-2 bg-white p-2">
              <Text>Khu vực trạng thái giao hàng</Text>
            </View>
            <View className="mt-2 bg-white p-2">
              <Text>Khu vực trạng thái báo cáo</Text>
            </View>
          </ScrollView>
          {globalOrderDetailState.isActionsShowing && (
            <View className="items-center justify-center">
              {order.status == OrderStatus.Pending && (
                <View className="w-full flex-row gap-x-2 items-center justify-between pt-3 px-2 bg-white mr-[-8px]">
                  <CustomButton
                    title="Nhận đơn"
                    handlePress={() => {
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
                                  Alert.alert(
                                    "Hoàn tất",
                                    `Đơn hàng MS-${order.id} đã được xác nhận!`
                                  );
                                  setOrder({
                                    ...order,
                                    status: OrderStatus.Confirmed,
                                  });
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
                    containerStyleClasses="flex-1 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-[#7dd3fc] font-semibold z-10"
                    // iconLeft={
                    //   <Ionicons name="filter-outline" size={21} color="white" />
                    // }
                    textStyleClasses="text-[16px] text-gray-900 ml-1 text-white text-gray-800"
                  />
                  <CustomButton
                    title="Từ chối"
                    handlePress={() => {
                      Alert.alert(
                        "Xác nhận",
                        `Bạn chắc chắn từ chối đơn hàng MS-${order.id} không?`,
                        [
                          {
                            text: "Hủy",
                            style: "cancel",
                          },
                          {
                            text: "Đồng ý",
                            onPress: async () => {
                              orderAPIService.reject(
                                order.id,
                                () => {
                                  Alert.alert(
                                    "Hoàn tất",
                                    `Đã từ chối đơn hàng MS-${order.id}!`
                                  );
                                  setOrder({
                                    ...order,
                                    status: OrderStatus.Rejected,
                                  });
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
                        ]
                      );
                    }}
                    containerStyleClasses="flex-1 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-[#fda4af] font-semibold z-10 ml-1 "
                    // iconLeft={
                    //   <Ionicons name="filter-outline" size={21} color="white" />
                    // }
                    textStyleClasses="text-[16px] text-gray-900 ml-1 text-white text-gray-700"
                  />
                </View>
              )}
              {order.status == OrderStatus.Confirmed && (
                <View className="w-full flex-row gap-x-2 items-center justify-between pt-3 px-2 bg-white mr-[-8px]">
                  <CustomButton
                    title="Chuẩn bị"
                    handlePress={() => {
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
                                  Alert.alert(
                                    "Hoàn tất",
                                    `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`
                                  );
                                  setOrder({
                                    ...order,
                                    status: OrderStatus.Preparing,
                                  });
                                },
                                (warningInfo: WarningMessageValue) => {
                                  Alert.alert("Xác nhận", warningInfo.message, [
                                    {
                                      text: "Đồng ý",
                                      onPress: async () => {
                                        orderAPIService.prepare(
                                          order.id,
                                          () => {
                                            Alert.alert(
                                              "Hoàn tất",
                                              `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`
                                            );
                                            setOrder({
                                              ...order,
                                              status: OrderStatus.Preparing,
                                            });
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
                                          true,
                                          (isSubmitting: boolean) => {}
                                        );
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
                                },
                                false,
                                (isSubmitting: boolean) => {}
                              );
                            },
                          },
                          {
                            text: "Hủy",
                          },
                        ]
                      );
                    }}
                    containerStyleClasses="flex-1 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-[#7dd3fc] font-semibold z-10"
                    textStyleClasses="text-[16px] text-gray-900 ml-1 text-white text-gray-800"
                  />
                  <CustomButton
                    title="Hủy"
                    handlePress={() => {
                      Alert.alert(
                        "Xác nhận",
                        `Bạn chắc chắn hủy đơn hàng MS-${order.id} không?`,
                        [
                          {
                            text: "Không",
                            // style: "cancel",
                          },
                          {
                            text: "Xác nhận hủy",
                            onPress: async () => {
                              orderAPIService.cancel(
                                order.id,
                                () => {
                                  Alert.alert(
                                    "Hoàn tất",
                                    `Đã hủy đơn hàng MS-${order.id}!`
                                  );
                                  setOrder({
                                    ...order,
                                    status: OrderStatus.Cancelled,
                                  });
                                },
                                (warningInfo: WarningMessageValue) => {
                                  Alert.alert(
                                    "Xác nhận",
                                    warningInfo?.message ||
                                      `Đơn hàng MS-${order.id} đã gần đến giờ đi giao (<=1h), bạn sẽ bị đánh cảnh cáo nếu tiếp tục hủy?`,
                                    [
                                      {
                                        text: "Không",
                                        // style: "cancel",
                                      },
                                      {
                                        text: "Xác nhận hủy",
                                        onPress: async () => {
                                          orderAPIService.cancel(
                                            order.id,
                                            () => {
                                              Alert.alert(
                                                "Hoàn tất",
                                                `Đã hủy đơn hàng MS-${order.id}!`
                                              );
                                              setOrder({
                                                ...order,
                                                status: OrderStatus.Cancelled,
                                              });
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
                                            }
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
                                },
                                true,
                                (value: boolean) => {}
                              );
                            },
                          },
                        ]
                      );
                    }}
                    containerStyleClasses="flex-1 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-[#d6d3d1] font-semibold z-10 ml-1"
                    textStyleClasses="text-[16px] text-gray-900 ml-1 text-white text-gray-700"
                  />
                </View>
              )}
              {order.status == OrderStatus.Preparing && (
                <View className="w-full flex-row gap-x-2 items-center justify-between pt-3 px-2 bg-white mr-[-8px]">
                  <CustomButton
                    title="Chọn nhân viên giao"
                    handlePress={() => {}}
                    containerStyleClasses="flex-1 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold z-10"
                    textStyleClasses="text-[16px] text-gray-900 ml-1 text-white text-gray-800"
                  />
                </View>
              )}
              {order.status == OrderStatus.Delivering && (
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
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default OrderDetail;
