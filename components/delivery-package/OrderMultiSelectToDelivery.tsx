import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import orderAPIService from "@/services/api-services/order-api-service";
import sessionService from "@/services/session-service";
import utilService from "@/services/util-service";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import {
  FrameStaffInfoModel,
  ShopDeliveryStaff,
  StaffInfoModel,
} from "@/types/models/StaffInfoModel";
import {
  FetchOnlyListResponse,
  FetchValueResponse,
} from "@/types/responses/FetchResponse";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View, TouchableOpacity } from "react-native";

import { ActivityIndicator } from "react-native-paper";
import { useToast } from "react-native-toast-notifications";
import CustomButton from "../custom/CustomButton";
import dayjs from "dayjs";
import { DeliveryPackageGroupDetailsModel } from "@/types/models/DeliveryPackageModel";
import { Dormitories } from "@/types/models/ShopProfileModel";
import orderUIService from "@/services/order-ui-service";

interface Props {
  orders: OrderFetchModel[];
  onSuccess: () => void;
  onError: (error: any) => void;
  onRefetch: () => void;
  startTime: number;
  endTime: number;
  intendedReceiveDate: string;
  // staffIds: number[];
  // setStaffIds: (ids: number[]) => void;
}
const OrderMultiSelectToDelivery = ({
  orders,
  onSuccess,
  onError,
  onRefetch,
  startTime,
  endTime,
  intendedReceiveDate,
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderIds, setOrderIds] = useState<number[]>([]);

  const onMutilDelivery = async () => {
    if (orderIds.length === 0) {
      Alert.alert("Vui lòng lựa chọn", "Bạn cần chọn ít nhất một đơn");
      return;
    }
    if (
      utilService.getInDeliveryTime(startTime, endTime, intendedReceiveDate) > 0
    ) {
      Alert.alert("Oops", "Đã quá thời gian giao hàng");
      onRefetch();
      return;
    }
    orderUIService.onMultiDelivery(
      orderIds,
      () => {
        setIsSubmitting(false);
        onSuccess();
      },
      (error) => {
        setIsSubmitting(false);
        onError(error);
      }
    );

    setIsSubmitting(true);
  };
  return (
    <View>
      {/* <Text className="font-semibold">Tiến hành đi giao</Text> */}

      {orders.length == 0 && <Text>Không có đơn hàng đang chuẩn bị nào</Text>}

      <View>
        <View className="">
          <TouchableOpacity
            className={`mt-2 flex-row items-center px-[4px] py-[8px] border-2 border-gray-200 rounded-md`}
            onPress={() => {
              if (orderIds.length < orders.length)
                setOrderIds(orders.map((item) => item.id));
              else setOrderIds([]);
            }}
          >
            {orderIds.length == orders.length ? (
              <View className="mr-2">
                <Ionicons name="checkmark-circle" size={19} color="green" />
              </View>
            ) : (
              <View
                className="w-[18px] h-[18px] border-2 border-gray-200 mr-2"
                style={{ borderRadius: 100 }}
              />
            )}

            <Text className="italic">Chọn tất cả</Text>
          </TouchableOpacity>
          {orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              className={`mt-2 flex-row items-center px-[4px] py-[8px] border-2 border-gray-200 rounded-md`}
              onPress={() => {
                if (!orderIds.includes(order.id))
                  setOrderIds([...orderIds, order.id]);
                else setOrderIds(orderIds.filter((id) => id != order.id));
              }}
            >
              {orderIds.includes(order.id) ? (
                <View className="mr-2 bg-green-600 rounded-sm">
                  <Ionicons name="checkmark-outline" size={19} color="white" />
                </View>
              ) : (
                <View className="w-[18px] h-[18px] border-2 border-gray-200 mr-2 rounded-sm" />
              )}

              <Text className="font-semibold">
                Đơn MS-{order.id} |
                <Text className="text-gray-700 text-[11px]">
                  (giao đến{" "}
                  {order.dormitoryId == Dormitories.A ? "Khu A" : "Khu B"})
                </Text>
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <CustomButton
        title="Tiến hành giao"
        handlePress={() => {
          onMutilDelivery();
        }}
        isLoading={isSubmitting}
        containerStyleClasses="mt-5 h-[36px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold z-10"
        textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
      />
      {/* <Toast position="bottom" /> */}
    </View>
  );
};

export default OrderMultiSelectToDelivery;
