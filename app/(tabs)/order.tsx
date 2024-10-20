import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "@/components/custom/CustomButton";
import { ActivityIndicator, Searchbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import PagingRequestQuery from "@/types/queries/PagingRequestQuery";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import FetchResponse from "@/types/responses/FetchResponse";
import OrderFetchModel, {
  getOrderStatusDescription,
  OrderStatus,
  sampleOrderFetchList,
} from "@/types/models/OrderFetchModel";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import sessionService from "@/services/session-service";
const formatTime = (time: number): string => {
  const hours = Math.floor(time / 100)
    .toString()
    .padStart(2, "0");
  const minutes = (time % 100).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
interface OrderFetchQuery extends PagingRequestQuery {
  status: number[];
  id: string;
  phoneNumber: string;
  startTime: number;
  endTime: number;
  intendedRecieveDate: string;
}

const filterStatuses = [
  {
    statuses: [
      OrderStatus.Pending,
      OrderStatus.Confirmed,
      OrderStatus.Preparing,
      OrderStatus.Delivering,
      OrderStatus.Delivered,
      OrderStatus.FailDelivery,
      OrderStatus.IssueReported,
      OrderStatus.UnderReview,
      OrderStatus.Completed,
      OrderStatus.Resolved,
      OrderStatus.Rejected,
      OrderStatus.Cancelled,
    ],
    label: "Tất cả",
  },
  {
    statuses: [OrderStatus.Pending],
    label: "Chờ xác nhận",
  },
  {
    statuses: [OrderStatus.Confirmed],
    label: "Đã xác nhận",
  },
  {
    statuses: [OrderStatus.Preparing],
    label: "Đang chuẩn bị",
  },
  {
    statuses: [OrderStatus.Delivering],
    label: "Đang giao",
  },
  {
    statuses: [OrderStatus.Delivered],
    label: "Giao thành công",
  },
  {
    statuses: [OrderStatus.FailDelivery],
    label: "Giao hàng thất bại",
  },
  {
    statuses: [OrderStatus.IssueReported, OrderStatus.UnderReview],
    label: "Đang báo cáo",
  },
  {
    statuses: [OrderStatus.Completed, OrderStatus.Resolved],
    label: "Hoàn tất",
  },
  {
    statuses: [OrderStatus.Rejected],
    label: "Đã từ chối",
  },
  {
    statuses: [OrderStatus.Cancelled],
    label: "Đơn hủy",
  },
];
const Order = () => {
  (async () => {
    console.log(await sessionService.getAuthToken());
  })();
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState<OrderFetchQuery>({
    status: filterStatuses[0].statuses,
    id: "",
    phoneNumber: "",
    pageIndex: 1,
    pageSize: 100_000_000,
    startTime: 0,
    endTime: 2400,
    intendedRecieveDate: "2024/10/18",
    // intendedRecieveDate: new Date()
    //   .toLocaleDateString("sv-SE")
    //   .replace(/-/g, "/"),
  } as OrderFetchQuery);

  const {
    data: orderFetchData,
    isLoading: isOrderFetchingLoading,
    error: orderFetchError,
    refetch: orderFetchRefetch,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.ORDER_LIST,
    async (): Promise<FetchResponse<OrderFetchModel>> =>
      apiClient
        .get(
          endpoints.ORDER_LIST +
            "?" +
            query.status.map((item) => "status=" + item).join("&"),
          {
            headers: {
              Authorization: `Bearer ${await sessionService.getAuthToken()}`,
            },
            params: {
              ...query,
            },
          }
        )
        .then((response) => response.data),
    [query]
  );
  // useEffect(() => {
  //   console.log("RESPONSE: ", orderFetchData);
  // }, [orderFetchData, query]);

  return (
    <View className="w-full h-full bg-white text-black p-4 relative">
      <CustomButton
        title="09/10/2024 | 8:00-8:30"
        handlePress={() => {}}
        containerStyleClasses="h-[32px] px-3 bg-transparent border-2 border-gray-200 absolute bottom-4 right-4 bg-secondary-100 font-psemibold z-10"
        iconLeft={<Ionicons name="filter-outline" size={21} color="white" />}
        textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
      />
      <View className="w-full gap-2">
        <View className="w-full">
          <Searchbar
            style={{
              height: 50,
              // backgroundColor: "white",
              // borderColor: "lightgray",
              // borderWidth: 2,
            }}
            inputStyle={{ minHeight: 0 }}
            placeholder="Nhập mã đơn hoặc số điện thoại..."
            onChangeText={(e) => {
              setQuery({ ...query, id: e, phoneNumber: e });
              setSearchText(e);
            }}
            value={searchText}
          />
        </View>
        <ScrollView style={{ width: "100%", flexShrink: 0 }} horizontal={true}>
          {isOrderFetchingLoading && (
            <ActivityIndicator
              animating={isOrderFetchingLoading}
              color="#FCF450"
            />
          )}
          <View className="w-full flex-row gap-2 items-center justify-between pb-2">
            {filterStatuses.map((filter, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setQuery({ ...query, status: filter.statuses })}
              >
                <Text
                  className={`bg-gray-100 rounded-xl px-4 py-2 ${
                    filter.statuses == query.status ? "bg-secondary" : ""
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <ScrollView style={{ width: "100%", flexGrow: 1 }}>
          <View className="gap-y-2 pb-[154px]">
            {orderFetchData?.value.items.map((order) => (
              <View
                key={order.id}
                className="p-4 pt-3 bg-white border-2 border-gray-300 rounded-lg"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-row items-center">
                    <Text className="text-[12px] font-psemibold bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-400 dark:text-dark-100">
                      MS-{order.id}
                    </Text>
                  </View>
                  <View className="flex-row gap-x-1 items-center">
                    {/* <TouchableOpacity
                      onPress={() => {}}
                      className="bg-white border-[#227B94] border-2 rounded-md items-center justify-center px-[4px] py-[2.2px]"
                    >
                      <Text className="text-[13.5px]">Chi tiết</Text>
                    </TouchableOpacity> */}
                    <Text className="ml-2  font-psemibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
                      {formatTime(order.startTime) +
                        " - " +
                        formatTime(order.endTime)}
                    </Text>
                    <Text
                      className={`text-[12px] font-medium me-2 px-2.5 py-1 rounded ${
                        getOrderStatusDescription(order.status)?.bgColor
                      } `}
                    >
                      {getOrderStatusDescription(order.status)?.description}
                    </Text>
                  </View>
                </View>
                <View className="mt-4 gap-1 pt-1">
                  <View className="flex-row justify-start items-center gap-2">
                    <Image
                      source={{
                        uri: order.foods[0].imageUrl,
                      }}
                      resizeMode="cover"
                      className="h-[36px] w-[40px] rounded-md opacity-85"
                    />
                    <View className="">
                      <Text className="text-md italic text-gray-500">
                        {order.foods[0].name}{" "}
                        {order.foods[0].quantity > 1 &&
                          " x" + order.foods[0].quantity}
                      </Text>
                      {order.foods.length > 1 && (
                        <Text className="text-md italic text-gray-500">
                          +{order.foods.length - 1} sản phẩm khác
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row justify-between items-end gap-x-2 gap-y-1">
                    <Text className="text-[10px] italic text-gray-500">
                      {order.customer.fullName} đã đặt vào{" "}
                      {new Date(order.orderDate).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {new Date(order.orderDate).toLocaleDateString()}
                    </Text>
                    <Text className="text-md italic text-gray-500">
                      {order.totalPrice.toLocaleString("vi-VN")}đ
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-end mt-2">
                  <TouchableOpacity
                    onPress={() => {}}
                    className="bg-white border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                  >
                    <Text className="text-[13.5px]">Chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Order;
