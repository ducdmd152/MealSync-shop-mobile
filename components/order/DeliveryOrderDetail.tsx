import apiClient from "@/services/api-services/api-client";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import ValueResponse from "@/types/responses/ValueReponse";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  View,
  RefreshControl,
} from "react-native";
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
  order: OrderFetchModel;
  setOrder: (order: OrderFetchModel) => void;
}
const DeliveryOrderDetail = ({
  orderId,
  onNotFound = () => {},
  containerStyleClasses = "",
  order,
  setOrder,
}: Props) => {
  // const [order, setOrder] = useState<OrderFetchModel>({} as OrderFetchModel);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const getOrderDetail = async (isRefetching = false) => {
    if (isRefetching) setIsReloading(true);
    try {
      const response = await apiClient.get<ValueResponse<OrderFetchModel>>(
        `shop-owner/order/${orderId}`,
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
      className={`items-center justify-center w-full  ${containerStyleClasses}`}
    >
      <View className="w-full h-full">
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
          <View className="mt-2 bg-white p-2">
            <Text className="text-[15px] text-gray-600 font-semibold">
              Chi tiết đơn hàng
            </Text>
            <View className="mt-3 border-gray-300 border-[0.5px]" />
            <View className="pt-4 gap-y-2">
              {order.orderDetails &&
                order.orderDetails.map((detail) => (
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
                    )}

                    {detail.note && (
                      <View className="flex-row gap-x-2 mt-[2px]">
                        <Text className="italic font-gray-500 text-[13.2px]">
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
      </View>
    </View>
  );
};

export default DeliveryOrderDetail;
