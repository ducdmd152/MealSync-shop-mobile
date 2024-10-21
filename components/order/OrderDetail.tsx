import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import apiClient from "@/services/api-services/api-client";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import ValueResponse from "@/types/responses/ValueReponse";
import { ActivityIndicator } from "react-native-paper";
import { getOrderStatusDescription } from "@/types/models/OrderFetchModel";
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
  const [order, setOrder] = useState<OrderDetailModel>({} as OrderDetailModel);
  const [isLoading, setIsLoading] = useState(true);
  const getOrderDetail = async () => {
    try {
      const response = await apiClient.get<ValueResponse<OrderDetailModel>>(
        `shop-owner/order/${orderId}`
      );
      setOrder({ ...response.data.value });
    } catch (error: any) {
      console.log("ERROR: ", error);
      onNotFound();
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getOrderDetail();
  }, []);

  return (
    <View
      className={`items-center justify-center w-full bg-[#f4f4f5] py-2 ${containerStyleClasses}`}
    >
      {isLoading ? (
        <ActivityIndicator color="#FCF450" />
      ) : (
        <View className="w-full">
          <View className="px-2 gap-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-[12.5px] text-gray-800 font-semibold mt-1">
                Đơn hàng MS-{order.id}
              </Text>
              <View className="flex-row gap-x-1 items-center">
                <Text className="ml-2  font-psemibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[10px] rounded">
                  {formatTime(order.startTime) +
                    " - " +
                    formatTime(order.endTime)}
                </Text>
                <Text
                  className={`text-[10px] font-medium me-2 px-2.5 py-1 rounded ${
                    getOrderStatusDescription(order.status)?.bgColor
                  }`}
                >
                  {getOrderStatusDescription(order.status)?.description}
                </Text>
              </View>
            </View>
            <View>
              <Text className="text-[10px] text-gray-500 italic">
                {order.customer.fullName} đã đặt vào{" "}
                {new Date(order.orderDate).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                {new Date(order.orderDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View className="mt-3 bg-white p-2">
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
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderDetail;
