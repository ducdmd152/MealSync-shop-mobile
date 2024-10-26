import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "@/components/custom/CustomButton";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import {
  ActivityIndicator,
  Searchbar,
  TouchableRipple,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import PagingRequestQuery from "@/types/queries/PagingRequestQuery";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import FetchResponse, {
  FetchOnlyListResponse,
} from "@/types/responses/FetchResponse";
import OrderFetchModel, {
  getOrderStatusDescription,
  OrderStatus,
  sampleOrderFetchList,
} from "@/types/models/OrderFetchModel";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import sessionService from "@/services/session-service";
import { RefreshControl } from "react-native-gesture-handler";
import { BottomSheet } from "@rneui/themed";
import { BlurView } from "expo-blur";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { OperatingSlotModel } from "@/types/models/OperatingSlotModel";
import { useFocusEffect } from "expo-router";
import TimeRangeSelect, {
  TimeRange,
} from "@/components/common/TimeRangeSelect";
import useTimeRangeState from "@/hooks/states/useTimeRangeState";
import OrderDetail from "@/components/order/OrderDetail";
import orderAPIService from "@/services/api-services/order-api-service";
import { warning } from "framer-motion";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
const formatTime = (time: number): string => {
  const hours = Math.floor(time / 100)
    .toString()
    .padStart(2, "0");
  const minutes = (time % 100).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
const formatDate = (dateString: string): string => {
  const date = new Date(dateString.replace(/\//g, "-"));
  return date.toLocaleDateString("en-GB");
};
const areArraysEqual = (arr1: number[], arr2: number[]): boolean => {
  if (arr1 == arr2) return true;
  if (arr1.length !== arr2.length) return false;

  const sortedArr1 = [...arr1].sort((a, b) => a - b);
  const sortedArr2 = [...arr2].sort((a, b) => a - b);

  return sortedArr1.every((value, index) => value === sortedArr2[index]);
};
const detailBottomHeight = Dimensions.get("window").height - 92;

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
  // (async () => {
  //   console.log(await sessionService.getAuthToken());
  // })();
  const globalTimeRangeState = useTimeRangeState();
  const [cacheOrderList, setCacheOrderList] = useState<OrderFetchModel[]>([]);
  const [isFilterBottomSheetVisible, setIsFilterBottomSheetVisible] =
    useState(false);
  const [isDetailBottomSheetVisible, setIsDetailBottomSheetVisible] =
    useState(false);
  const [detailBottomSheetDisplay, setDetailBottomSheetDisplay] =
    useState(true);
  const [orderDetailId, setOrderDetailId] = useState(0);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isRangePickerVisible, setRangePickerVisibility] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [isQueryChanging, setIsQueryChanging] = useState(true);
  const {
    data: operatingSlots,
    isLoading: isOperatingSlotsLoading,
    error: operatingSlotsError,
    refetch: operatingSlotsRefetch,
    isRefetching: isOperatingSlotsRefetching,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.OPERATING_SLOT_LIST.concat(["order-list-page"]),
    (): Promise<FetchOnlyListResponse<OperatingSlotModel>> =>
      apiClient
        .get(endpoints.OPERATING_SLOT_LIST)
        .then((response) => response.data),
    []
  );
  const [query, setQuery] = useState<OrderFetchQuery>({
    status: filterStatuses[0].statuses,
    id: "",
    phoneNumber: "",
    pageIndex: 1,
    pageSize: 100_000_000,
    startTime:
      operatingSlots?.value && operatingSlots?.value.length
        ? operatingSlots.value[0].startTime
        : 0,
    endTime:
      operatingSlots?.value && operatingSlots?.value.length
        ? operatingSlots.value[operatingSlots.value.length - 1].endTime
        : 2400,
    // intendedRecieveDate: "2024/10/18",
    intendedRecieveDate: new Date()
      .toLocaleDateString("sv-SE")
      .replace(/-/g, "/"),
  } as OrderFetchQuery);

  const {
    data: orderFetchData,
    isLoading: isOrderFetchingLoading,
    isRefetching: isOrderRefetching,
    error: orderFetchError,
    refetch: orderFetchRefetch,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.ORDER_LIST.concat(["order-list-page"]),
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
  useEffect(() => {
    if (
      !isOperatingSlotsLoading &&
      !isOperatingSlotsRefetching &&
      operatingSlots?.value &&
      operatingSlots?.value.length &&
      (globalTimeRangeState.minTime != operatingSlots.value[0].startTime ||
        globalTimeRangeState.maxTime !=
          operatingSlots.value[operatingSlots.value.length - 1].endTime)
    ) {
      globalTimeRangeState.setMinTime(operatingSlots.value[0].startTime);
      globalTimeRangeState.setMaxTime(
        operatingSlots.value[operatingSlots.value.length - 1].endTime
      );
    }
  }, [operatingSlots, isOperatingSlotsLoading, isOperatingSlotsRefetching]);

  useEffect(() => {
    if (globalTimeRangeState.isEditing) return;
    setQuery({
      ...query,
      startTime: globalTimeRangeState.startTime,
      endTime: globalTimeRangeState.endTime,
    });
  }, [globalTimeRangeState]);

  useEffect(() => {
    setIsQueryChanging(true);
    setTimeout(() => {
      setIsQueryChanging(false);
    }, 1000);
    // console.log("Query: ", query);
  }, [query]);

  useFocusEffect(
    React.useCallback(() => {
      orderFetchRefetch();
      operatingSlotsRefetch();
    }, [])
  );

  return (
    <View className="w-full h-full bg-white text-black p-4 relative">
      <CustomButton
        title={
          formatDate(query.intendedRecieveDate) +
          " | " +
          formatTime(query.startTime) +
          " - " +
          formatTime(query.endTime)
        }
        handlePress={() => {
          setIsFilterBottomSheetVisible(true);
        }}
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
          <View className="w-full flex-row gap-2 items-center justify-between pb-2">
            {filterStatuses.map((filter, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setQuery({ ...query, status: filter.statuses })}
              >
                <Text
                  className={`bg-gray-100 rounded-xl px-4 py-2 ${
                    areArraysEqual(filter.statuses, query.status)
                      ? "bg-secondary"
                      : ""
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <ScrollView
          style={{ width: "100%", flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              tintColor={"#FCF450"}
              refreshing={isOrderRefetching && !isQueryChanging}
              onRefresh={() => {
                // setQuery({
                //   status: filterStatuses[0].statuses,
                //   id: "",
                //   phoneNumber: "",
                //   pageIndex: 1,
                //   pageSize: 100_000_000,
                //   startTime: 0,
                //   endTime: 2400,
                //   intendedRecieveDate: "2024/10/18",
                // });
                orderFetchRefetch();
              }}
            />
          }
        >
          {isOrderFetchingLoading && (
            <ActivityIndicator
              animating={isOrderFetchingLoading}
              color="#FCF450"
            />
          )}
          <View className="gap-y-2 pb-[154px]">
            {!cacheOrderList.length && (
              <Text className="text-gray-600 text-center pt-8">
                Không có đơn hàng tương ứng.
              </Text>
            )}
            {cacheOrderList.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => {
                  setOrderDetailId(order.id);
                  setIsDetailBottomSheetVisible(true);
                }}
                className="p-4 pt-3 bg-white border-2 border-gray-300 rounded-lg"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-row items-center">
                    <Text className="text-[12px] font-psemibold bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100">
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
                      {/* {order.dormId == 1 ? "Giao đến KTX khu A" : "Giao đến KTX khu B"} */}
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
                <View className="flex-row justify-end mt-2 gap-x-1">
                  {order.status == OrderStatus.Pending && (
                    <View className="flex-row items-center gap-x-1">
                      <TouchableOpacity
                        onPress={() => {
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
                                      setCacheOrderList(
                                        cacheOrderList.map((item) =>
                                          item.id != order.id
                                            ? item
                                            : {
                                                ...order,
                                                status: OrderStatus.Confirmed,
                                              }
                                        )
                                      );
                                    },
                                    (warningInfo: WarningMessageValue) => {},
                                    (error: any) => {
                                      Alert.alert(
                                        "Oops!",
                                        error?.response?.data?.error?.message ||
                                          "Hệ thống gặp lỗi, vui lòng thử lại sau!"
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
                        className="bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                      >
                        <Text className="text-[13.5px]">Nhận đơn</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
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
                                      setCacheOrderList(
                                        cacheOrderList.map((item) =>
                                          item.id != order.id
                                            ? item
                                            : {
                                                ...order,
                                                status: OrderStatus.Rejected,
                                              }
                                        )
                                      );
                                    },
                                    (warningInfo: WarningMessageValue) => {},
                                    (error: any) => {
                                      Alert.alert(
                                        "Oops!",
                                        error?.response?.data?.error?.message ||
                                          "Hệ thống gặp lỗi, vui lòng thử lại sau!"
                                      );
                                    }
                                  );
                                },
                              },
                            ]
                          );
                        }}
                        className="bg-white border-[#fda4af] bg-[#fda4af] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                      >
                        <Text className="text-[13.2px]">Từ chối</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {order.status == OrderStatus.Confirmed && (
                    <View className="flex-row items-center gap-x-1">
                      <TouchableOpacity
                        onPress={() => {
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
                                      setCacheOrderList(
                                        cacheOrderList.map((item) =>
                                          item.id != order.id
                                            ? item
                                            : {
                                                ...order,
                                                status: OrderStatus.Preparing,
                                              }
                                        )
                                      );
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
                                                  Alert.alert(
                                                    "Hoàn tất",
                                                    `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`
                                                  );
                                                  setCacheOrderList(
                                                    cacheOrderList.map((item) =>
                                                      item.id != order.id
                                                        ? item
                                                        : {
                                                            ...order,
                                                            status:
                                                              OrderStatus.Preparing,
                                                          }
                                                    )
                                                  );
                                                },
                                                (
                                                  warningInfo: WarningMessageValue
                                                ) => {},
                                                (error: any) => {
                                                  Alert.alert(
                                                    "Oops!",
                                                    error?.response?.data?.error
                                                      ?.message ||
                                                      "Hệ thống gặp lỗi, vui lòng thử lại sau!"
                                                  );
                                                },
                                                (isSubmitting: boolean) => {},
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
                                          "Hệ thống gặp lỗi, vui lòng thử lại sau!"
                                      );
                                    },
                                    (isSubmitting: boolean) => {},
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
                        className="bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                      >
                        <Text className="text-[13.5px]">Chuẩn bị</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
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
                                      setCacheOrderList(
                                        cacheOrderList.map((item) =>
                                          item.id != order.id
                                            ? item
                                            : {
                                                ...order,
                                                status: OrderStatus.Rejected,
                                              }
                                        )
                                      );
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
                                                  setCacheOrderList(
                                                    cacheOrderList.map((item) =>
                                                      item.id != order.id
                                                        ? item
                                                        : {
                                                            ...order,
                                                            status:
                                                              OrderStatus.Rejected,
                                                          }
                                                    )
                                                  );
                                                },
                                                (
                                                  warningInfo: WarningMessageValue
                                                ) => {},
                                                (error: any) => {
                                                  Alert.alert(
                                                    "Oops!",
                                                    error?.response?.data?.error
                                                      ?.message ||
                                                      "Hệ thống gặp lỗi, vui lòng thử lại sau!"
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
                                          "Hệ thống gặp lỗi, vui lòng thử lại sau!"
                                      );
                                    },
                                    (value: boolean) => {},
                                    true
                                  );
                                },
                              },
                            ]
                          );
                        }}
                        className="bg-white border-[#d6d3d1] bg-[#d6d3d1] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                      >
                        <Text className="text-[13.2px]">Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {order.status == OrderStatus.Preparing && (
                    <View className="flex-row items-center gap-x-1">
                      <TouchableOpacity
                        onPress={() => {}}
                        className="bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                      >
                        <Text className="text-[13.5px]">
                          Tiến hành giao hàng
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
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      <BottomSheet modalProps={{}} isVisible={isFilterBottomSheetVisible}>
        <View className="p-4 bg-white rounded-t-lg min-h-[120px]">
          <TouchableOpacity
            className="items-center"
            onPress={() => setIsFilterBottomSheetVisible(false)}
          >
            <Ionicons name="chevron-down-outline" size={24} color="gray" />
          </TouchableOpacity>
          <View className="flex-row gap-x-1 mt-7">
            <View className="flex-col relative">
              <Text className="text-gray-500  text-sm absolute top-[-8px] bg-white z-10 left-5">
                Ngày
              </Text>
              <TouchableRipple
                onPress={() => {
                  setDatePickerVisibility(true);
                }}
                className="border-2 border-gray-300 p-2 rounded-md"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-black mx-2 text-lg">
                    {formatDate(query.intendedRecieveDate)}
                  </Text>
                  <Ionicons name="create-outline" size={21} color="gray-600" />
                </View>
              </TouchableRipple>
              <Modal
                animationType="slide"
                transparent={true}
                visible={isDatePickerVisible}
                onRequestClose={() => setDatePickerVisibility(false)}
              >
                <BlurView
                  intensity={50}
                  style={styleTimePicker.modalBackground}
                >
                  <View style={styleTimePicker.modalContent}>
                    <DateTimePicker
                      minDate={dayjs("2024-01-01").toDate()}
                      maxDate={
                        new Date(new Date().setDate(new Date().getDate() + 1))
                      }
                      mode="single"
                      locale="vi-VN"
                      date={dayjs(query.intendedRecieveDate).toDate()}
                      onChange={(params) => {
                        if (params.date) {
                          const formattedDate = dayjs(params.date).format(
                            "YYYY/MM/DD"
                          );
                          setQuery({
                            ...query,
                            intendedRecieveDate: formattedDate,
                          });
                          // console.log(
                          //   "intendedRecieveDate",
                          //   query.intendedRecieveDate
                          // );
                        }
                        setDatePickerVisibility(false);
                      }}
                    />
                  </View>
                </BlurView>
              </Modal>
            </View>

            <View className="flex-col flex-1 relative">
              <Text className="text-gray-500  text-sm absolute top-[-8px] bg-white z-10 left-5">
                Khoảng thời gian
              </Text>
              <TouchableRipple
                onPress={() => {
                  globalTimeRangeState.setIsEditing(true);
                  setRangePickerVisibility(true);
                }}
                className="border-2 border-gray-300 p-2 rounded-md"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-black mx-2 text-lg">
                    {formatTime(query.startTime) +
                      " - " +
                      formatTime(query.endTime)}
                  </Text>
                  <Ionicons name="create-outline" size={21} color="gray-600" />
                </View>
              </TouchableRipple>
              <Modal
                animationType="slide"
                transparent={true}
                visible={isRangePickerVisible}
                onRequestClose={() => {
                  setRangePickerVisibility(false);
                  globalTimeRangeState.setIsEditing(false);
                }}
              >
                <BlurView
                  intensity={50}
                  style={styleTimePicker.modalBackground}
                >
                  <View style={styleTimePicker.modalContent}>
                    <TimeRangeSelect />
                    <CustomButton
                      title="Hoàn tất"
                      handlePress={() => {
                        setRangePickerVisibility(false);
                        globalTimeRangeState.setIsEditing(false);
                      }}
                      containerStyleClasses="mt-5 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-psemibold z-10"
                      textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
                    />
                  </View>
                </BlurView>
              </Modal>
            </View>
          </View>
          <CustomButton
            title="Hoàn tất"
            handlePress={() => {
              setIsFilterBottomSheetVisible(false);
            }}
            containerStyleClasses="mt-5 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-primary font-psemibold z-10"
            // iconLeft={
            //   <Ionicons name="filter-outline" size={21} color="white" />
            // }
            textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
          />
        </View>
      </BottomSheet>
      <BottomSheet modalProps={{}} isVisible={isDetailBottomSheetVisible}>
        {detailBottomSheetDisplay && (
          <View
            className={`p-4 bg-white rounded-t-lg min-h-[120px]`}
            style={{ height: detailBottomHeight }}
          >
            <TouchableOpacity
              className="items-center"
              onPress={() => setIsDetailBottomSheetVisible(false)}
            >
              <Ionicons name="chevron-down-outline" size={24} color="gray" />
            </TouchableOpacity>
            <View className="flex-1 mt-2">
              <OrderDetail
                orderId={orderDetailId}
                onNotFound={() => {
                  setDetailBottomSheetDisplay(false);
                  Alert.alert(
                    `Đơn hàng MS-${orderDetailId} không tồn tại`,
                    "Vui lòng thử lại!"
                  );
                  orderFetchRefetch();
                  setTimeout(() => {
                    setIsDetailBottomSheetVisible(false);
                    setTimeout(() => setDetailBottomSheetDisplay(true), 1000);
                  }, 1000);
                }}
              />
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
};

export default Order;

const styleTimePicker = StyleSheet.create({
  drawerText: {
    color: "white",
    backgroundColor: "#DF4830",
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  datePickerButton: {
    backgroundColor: "#065b1a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  datePickerText: {
    color: "white",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});
