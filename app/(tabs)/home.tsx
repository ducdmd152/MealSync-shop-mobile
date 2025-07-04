import CustomButton from "@/components/custom/CustomButton";
import CONSTANTS from "@/constants/data";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import useOrderStatusFilterState from "@/hooks/states/useOrderStatusFilter";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import utilService from "@/services/util-service";
import { filterStatuses } from "@/types/models/OrderFetchModel";
import { ShopProfileGetModel } from "@/types/models/ShopProfileModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, useFocusEffect } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "react-native-paper";
interface HomeStatisticsModel {
  orderStatisticInToday: {
    date: string;
    totalOrderPending: number;
    totalOrderConfirmed: number;
    totalOrderPreparing: number;
    totalOrderDelivering: number;
    totalOrderFailDelivery: number;
    totalOrderCompleted: number;
  };
  orderStatisticInMonth: {
    month: number;
    startDate: string;
    endDate: string;
    revenue: number;
    totalSuccess: number;
    totalFailOrRefund: number;
    totalCancelOrReject: number;
  };
}

export default function HomeScreen() {
  const globalOrderStatusesFilterState = useOrderStatusFilterState();
  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_PROFILE_FULL_INFO,
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    []
  );
  const statistics = useFetchWithRQWithFetchFunc(
    [endpoints.HOME_STATISTICS].concat(["home"]),
    async (): Promise<FetchValueResponse<HomeStatisticsModel>> =>
      apiClient
        .get(endpoints.HOME_STATISTICS)
        .then((response) => response.data),
    []
  );
  useFocusEffect(
    React.useCallback(() => {
      // router.push("/map");
      shopProfile.refetch();
      statistics.refetch();
    }, [])
  );
  return (
    <View className="w-full h-full flex-1 items-center justify-start bg-white p-2">
      <View className="w-full h-[86px] flex-row items-center justify-between p-2 gap-x-2">
        <View className="flex-1 items-start">
          <Text className="text-lg text-gray-600">Cửa hàng</Text>
          <Text className="flex-1 text-[24px] text-gray text-primary font-medium">
            {shopProfile.data?.value.name || "------------------------"}
          </Text>
        </View>
        <View className="py-1 mt-1">
          <View className="w-[52px] justify-center items-center border-[0.4px] border-gray-100 rounded-full p-1">
            <Avatar.Image
              size={44}
              source={{
                uri: shopProfile.data?.value.logoUrl || CONSTANTS.url.pink,
              }}
            />
          </View>
        </View>
      </View>
      <ScrollView style={{ width: "100%", flexGrow: 1 }}>
        <View className="w-full items-start p-2">
          <View className="w-full flex-row justify-between items-center mb-3">
            <Text className="text-lg text-gray-600">Đơn hàng hôm nay</Text>
            <Link href="/order" className="text-primary opacity-85 italic">
              {"Xem đơn hàng >>>"}
            </Link>
          </View>
          <View className="w-full flex-row gap-2 items-between">
            <TouchableOpacity
              onPress={() => {
                globalOrderStatusesFilterState.setStatuses(
                  filterStatuses[1].statuses
                );
                router.push("/order");
              }}
              className="flex-1 h-[80px] bg-gray-000  border-2 border-gray-200 rounded-xl items-center justify-center"
            >
              <Text className="font-semibold text-xl text-secondary-100">
                {statistics.data?.value.orderStatisticInToday.totalOrderPending}
              </Text>
              <Text className="text-center text-secondary text-[12px]">
                chờ xác nhận
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                globalOrderStatusesFilterState.setStatuses(
                  filterStatuses[2].statuses
                );
                router.push("/order");
              }}
              className="flex-1 h-[80px] bg-gray-000  border-2 border-gray-200 rounded-xl items-center justify-center"
            >
              <Text className="font-semibold text-xl">
                {
                  statistics.data?.value.orderStatisticInToday
                    .totalOrderConfirmed
                }
              </Text>
              <Text className="text-center text-[12px]">đã xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                globalOrderStatusesFilterState.setStatuses(
                  filterStatuses[3].statuses
                );
                router.push("/order");
              }}
              className="flex-1 h-[80px] bg-gray-000  border-2 border-gray-200 rounded-xl items-center justify-center"
            >
              <Text className="font-semibold text-xl">
                {
                  statistics.data?.value.orderStatisticInToday
                    .totalOrderPreparing
                }
              </Text>
              <Text className="text-center text-[12px]">đang chuẩn bị</Text>
            </TouchableOpacity>
          </View>
          <View className="w-full flex-row gap-2 items-between mt-2">
            <TouchableOpacity
              onPress={() => {
                globalOrderStatusesFilterState.setStatuses(
                  filterStatuses[4].statuses
                );
                router.push("/order");
              }}
              className="flex-1 h-[80px] bg-gray-000 border-2 border-gray-200 rounded-xl items-center justify-center"
            >
              <Text className="font-semibold text-xl">
                {
                  statistics.data?.value.orderStatisticInToday
                    .totalOrderDelivering
                }
              </Text>
              <Text className="text-center text-[12px]">đang giao</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                globalOrderStatusesFilterState.setStatuses(
                  filterStatuses[5].statuses
                );
                router.push("/order");
              }}
              className="flex-1 h-[80px] bg-gray-000 border-2 border-gray-200 rounded-xl items-center justify-center"
            >
              <Text className="font-semibold text-xl">
                {
                  statistics.data?.value.orderStatisticInToday
                    .totalOrderCompleted
                }
              </Text>
              <Text className="text-center text-[12px]">giao thành công</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                globalOrderStatusesFilterState.setStatuses(
                  filterStatuses[6].statuses
                );
                router.push("/order");
              }}
              className="flex-1 h-[80px] bg-gray-000 border-2 border-gray-200 rounded-xl items-center justify-center"
            >
              <Text className="font-semibold text-xl text-red-500">
                {
                  statistics.data?.value.orderStatisticInToday
                    .totalOrderFailDelivery
                }
              </Text>
              <Text className="text-center text-red-500 text-[12px]">
                giao thất bại
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* STATISTICS */}
        <View className="w-full items-center p-2">
          <View className="w-full flex-row justify-between items-center mb-3">
            <Text className="text-lg text-gray-600">Thống kê bán hàng</Text>
            <Text className="text-gray-600 opacity-85 italic pr-4">
              {statistics.data?.value.orderStatisticInMonth.month &&
                "Tháng " + statistics.data?.value.orderStatisticInMonth.month}
            </Text>
          </View>
          <View className="w-full h-[80px] bg-gray-000 flex-col rounded-xl items-center justify-center mb-3 bg-yellow-100">
            <Text className="font-semibold">Doanh thu tháng</Text>
            <Text className="text-center text-lg font-bold">
              {statistics.data?.value.orderStatisticInMonth.revenue != undefined
                ? utilService.formatPrice(
                    statistics.data?.value.orderStatisticInMonth.revenue
                  ) + " đ"
                : "--------"}{" "}
            </Text>
          </View>
          <View className="w-full flex-row gap-2 items-between">
            <TouchableOpacity className="flex-1  bg-yellow-100 flex-col rounded-xl items-center justify-center p-1 py-2">
              <Text className="font-semibold text-green-500">
                {statistics.data?.value.orderStatisticInMonth.totalSuccess}
              </Text>
              <Text className="text-center text-green-500">
                Đơn hàng {"\n"} thành công
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1  bg-yellow-100  flex-col rounded-xl items-center justify-center p-1 py-2">
              <Text className="font-semibold text-red-500">
                {statistics.data?.value.orderStatisticInMonth.totalFailOrRefund}
              </Text>
              <Text className="text-center text-red-500">
                Đơn hàng thất bại/hoàn tiền
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-yellow-100 rounded-xl items-center justify-center p-1 py-2">
              <Text className="font-semibold text-purple-500">
                {
                  statistics.data?.value.orderStatisticInMonth
                    .totalCancelOrReject
                }
              </Text>
              <Text className="text-center text-purple-500">
                Đơn hàng {"\n"}hủy/từ chối
              </Text>
            </TouchableOpacity>
          </View>
          <CustomButton
            handlePress={() => router.push("/shop/statistics")}
            title="Xem chi tiết thống kê"
            iconRight={
              <View className="mt-[-3px] ml-[3px]">
                <Ionicons
                  size={17}
                  name="arrow-forward-outline"
                  color="#FFB200"
                />
              </View>
            }
            containerStyleClasses="h-[42px] border-gray-400 border-2 bg-white mt-4"
            textStyleClasses="text-[14px] font-medium text-[#FFB200]"
          />
        </View>
      </ScrollView>
    </View>
  );
}
