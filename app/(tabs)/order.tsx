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
  Portal,
  Searchbar,
  TouchableRipple,
  Modal as ModalPaper,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import PagingRequestQuery from "@/types/queries/PagingRequestQuery";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import FetchResponse, {
  FetchOnlyListResponse,
} from "@/types/responses/FetchResponse";
import OrderFetchModel, {
  filterStatuses,
  getOrderStatusDescription,
  OrderStatus,
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
import OrderDeliveryAssign from "@/components/delivery-package/OrderDeliveryAssign";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import {
  ShopDeliveryStaff,
  StaffInfoModel,
} from "@/types/models/StaffInfoModel";
import utilService from "@/services/util-service";
import useOrderStatusFilterState from "@/hooks/states/useOrderStatusFilter";
import OrderDetailBottomSheet from "@/components/target-bottom-sheets/OrderDetailBottomSheet";
import useGlobalOrderDetailState from "@/hooks/states/useGlobalOrderDetailState";
import { Dormitories } from "@/types/models/ShopProfileModel";
import Toast from "react-native-toast-message";
import { useToast } from "react-native-toast-notifications";
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
  intendedReceiveDate: string;
}

const Order = () => {
  // (async () => {
  //   console.log(await sessionService.getAuthToken());
  // })();
  const simpleToast = useToast();
  const globalTimeRangeState = useTimeRangeState();
  const [order, setOrder] = useState<OrderFetchModel>({} as OrderFetchModel);
  const [cacheOrderList, setCacheOrderList] = useState<OrderFetchModel[]>([]);
  const [isFilterBottomSheetVisible, setIsFilterBottomSheetVisible] =
    useState(false);

  const [orderDetailId, setOrderDetailId] = useState(0);
  const globalOrderDetailState = useGlobalOrderDetailState();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isRangePickerVisible, setRangePickerVisibility] = useState(false);
  const [isOpenOrderAssign, setIsOpenOrderAssign] = React.useState(false);
  const [isFocusing, setIsFocusing] = React.useState(false);
  const [searchText, setSearchText] = useState("");
  const [isQueryChanging, setIsQueryChanging] = useState(true);
  const globalOrderStatusesFilterState = useOrderStatusFilterState();
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
    status: globalOrderStatusesFilterState.statuses,
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
    // intendedReceiveDate: "2024/10/18",
    intendedReceiveDate: new Date()
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
    REACT_QUERY_CACHE_KEYS.ORDER_LIST.concat(["order-tab-page"]),
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
    setCacheOrderList(orderFetchData?.value.items || []);
  }, [orderFetchData?.value.items]);
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
      intendedReceiveDate: dayjs(globalTimeRangeState.date).format(
        "YYYY/MM/DD"
      ),
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

  // useEffect(() => {
  //   globalOrderStatusesFilterState.setStatuses([...query.status]);
  //   console.log(query.status);
  // }, [query.status]);
  useEffect(() => {
    if (isFocusing) {
      setQuery({
        ...query,
        status: globalOrderStatusesFilterState.statuses,
      });
      orderFetchRefetch();
      operatingSlotsRefetch();
    } else globalOrderStatusesFilterState.setStatuses(query.status);
  }, [isFocusing]);
  useFocusEffect(
    React.useCallback(() => {
      setIsFocusing(true);
      return () => {
        setIsFocusing(false);
      };
    }, [])
  );
  const setCacheOrderInList = (order: OrderFetchModel) =>
    setCacheOrderList(
      cacheOrderList.map((item) =>
        item.id != order.id
          ? item
          : {
              ...order,
            }
      )
    );
  return (
    <View className="w-full h-full bg-white text-black p-4 relative">
      <CustomButton
        title={
          formatDate(query.intendedReceiveDate) +
          " | " +
          formatTime(query.startTime) +
          " - " +
          formatTime(query.endTime)
        }
        handlePress={() => {
          setIsFilterBottomSheetVisible(true);
        }}
        containerStyleClasses="h-[32px] px-3 bg-transparent border-2 border-gray-200 absolute bottom-4 right-4 bg-secondary-100 font-semibold z-10"
        iconLeft={<Ionicons name="filter-outline" size={21} color="white" />}
        textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
      />
      <Portal>
        <ModalPaper
          visible={isOpenOrderAssign}
          onDismiss={() => setIsOpenOrderAssign(false)}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
          }}
        >
          <OrderDeliveryAssign
            onComplete={(shopDeliveryStaff: ShopDeliveryStaff) => {
              setIsOpenOrderAssign(false);
              setCacheOrderInList({
                ...order,
                shopDeliveryStaff: shopDeliveryStaff,
              });
              simpleToast.show(
                `Đơn hàng MS-${order.id} sẽ được giao bởi ${
                  shopDeliveryStaff.id == 0 ? "bạn" : shopDeliveryStaff.fullName
                }!`,
                {
                  type: "success",
                  duration: 3000,
                }
              );
            }}
            order={order}
            isNeedForReconfimation={order.shopDeliveryStaff ? false : true}
          />
        </ModalPaper>
      </Portal>

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
                //   intendedReceiveDate: "2024/10/18",
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
          <View className="gap-y-2 pb-[192px]">
            {!isOrderFetchingLoading && !cacheOrderList.length && (
              <Text className="text-gray-600 text-center pt-8">
                Không có đơn hàng tương ứng.
              </Text>
            )}
            {cacheOrderList.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => {
                  // setOrderDetailId(order.id);
                  globalOrderDetailState.setId(order.id);
                  globalOrderDetailState.setModel(order);
                  globalOrderDetailState.setIsActionsShowing(true);
                  globalOrderDetailState.setIsDetailBottomSheetVisible(true);
                  globalOrderDetailState.setOnAfterCompleted(() => {
                    orderFetchRefetch();
                  });
                  setOrder(order);
                }}
                className="p-4 pt-3 bg-white border-2 border-gray-300 rounded-lg"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-row items-center">
                    <Text className="text-[12px] font-semibold bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100">
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
                    <Text className="ml-2  font-semibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
                      {formatTime(order.startTime) +
                        " - " +
                        formatTime(order.endTime)}
                    </Text>
                    <Text
                      className={`text-[11px] font-medium me-2 px-2.5 py-[3px] rounded ${
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
                        uri: order.orderDetails[0].imageUrl,
                      }}
                      resizeMode="cover"
                      className="h-[28px] w-[36px] rounded-md opacity-85"
                    />
                    <View className="">
                      <Text className="text-md italic text-gray-500">
                        {order.orderDetailSummaryShort.split("+")[0]}
                      </Text>
                      {order.orderDetails.length > 1 && (
                        <Text className="text-md italic text-gray-500">
                          +{order.orderDetailSummary.split("+")[1]}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center gap-x-2 gap-y-1">
                    <View>
                      <Text className="text-[10px] italic text-gray-500">
                        {/* Được đặt vào{" "}
                      {new Date(order.orderDate).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {new Date(order.orderDate).toLocaleDateString()}
                      {"\n"} */}
                        {order.dormitoryId == Dormitories.A
                          ? "Giao đến KTX khu A"
                          : "Giao đến KTX khu B"}
                      </Text>
                      {order.shopDeliveryStaff && (
                        <Text className="text-[10px] italic text-gray-500">
                          Người đi giao:{" "}
                          {utilService.shortenName(
                            order.shopDeliveryStaff?.fullName || ""
                          )}
                        </Text>
                      )}
                    </View>

                    <Text className="text-md italic text-gray-500">
                      {utilService.formatPrice(
                        order.totalPrice - order.totalPromotion
                      )}{" "}
                      ₫
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-end mt-2 gap-x-1">
                  {order.status == OrderStatus.Pending &&
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
                              orderFetchRefetch();
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
                                        // const toast = Toast.show({
                                        //   type: "info",
                                        //   text1: "Hoàn tất",
                                        //   text2: `Đơn hàng MS-${order.id} đã được xác nhận!`,
                                        // });
                                        simpleToast.show(
                                          `Đơn hàng MS-${order.id} đã được xác nhận!`,
                                          {
                                            type: "info",
                                            duration: 1500,
                                          }
                                        );
                                        // Alert.alert(
                                        //   "Hoàn tất",
                                        //   `Đơn hàng MS-${order.id} đã được xác nhận!`
                                        // );
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
                                          error?.response?.data?.error
                                            ?.message ||
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
                                  text: "Xác nhận",
                                  onPress: async () => {
                                    orderAPIService.reject(
                                      order.id,
                                      () => {
                                        // const toast = Toast.show({
                                        //   type: "info",
                                        //   text1: "Hoàn tất",
                                        //   text2: `Đã từ chối đơn hàng MS-${order.id}!`,
                                        // });
                                        simpleToast.show(
                                          `Đã từ chối đơn hàng MS-${order.id}!`,
                                          {
                                            type: "info",
                                            duration: 1500,
                                          }
                                        );
                                        // Alert.alert(
                                        //   "Hoàn tất",
                                        //   `Đã từ chối đơn hàng MS-${order.id}!`
                                        // );
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
                          }}
                          className="bg-white border-[#fda4af] bg-[#fda4af] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                        >
                          <Text className="text-[13.2px]">Từ chối</Text>
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
                          onPress={() => {
                            const inTime = utilService.getInFrameTime(
                              order.startTime,
                              order.endTime,
                              order.intendedReceiveDate
                            );
                            if (inTime > 0) {
                              orderFetchRefetch();
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
                                        // const toast = Toast.show({
                                        //   type: "info",
                                        //   text1: "Hoàn tất",
                                        //   text2: `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`,
                                        // });
                                        simpleToast.show(
                                          `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`,
                                          {
                                            type: "info",
                                            duration: 1500,
                                          }
                                        );
                                        // Alert.alert(
                                        //   "Hoàn tất",
                                        //   `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`
                                        // );
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
                                                    // const toast = Toast.show({
                                                    //   type: "info",
                                                    //   text1: "Hoàn tất",
                                                    //   text2: `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`,
                                                    // });
                                                    simpleToast.show(
                                                      `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`,
                                                      {
                                                        type: "info",
                                                        duration: 1500,
                                                      }
                                                    );
                                                    // Alert.alert(
                                                    //   "Hoàn tất",
                                                    //   `Đơn hàng MS-${order.id} bắt đầu được chuẩn bị!`
                                                    // );
                                                    setCacheOrderList(
                                                      cacheOrderList.map(
                                                        (item) =>
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
                                                      error?.response?.data
                                                        ?.error?.message ||
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
                                          error?.response?.data?.error
                                            ?.message ||
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
                          className="bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                        >
                          <Text className="text-[13.5px]">Chuẩn bị</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            const inTime = utilService.getInFrameTime(
                              order.startTime,
                              order.endTime,
                              order.intendedReceiveDate
                            );
                            if (inTime > 0) {
                              orderFetchRefetch();
                              Alert.alert(
                                "Oops!",
                                "Đã quá thời gian để thực hiện thao tác này!"
                              );
                              return false;
                            }
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
                                        // Alert.alert(
                                        //   "Hoàn tất",
                                        //   `Đã hủy đơn hàng MS-${order.id}!`
                                        // );
                                        // const toast = Toast.show({
                                        //   type: "info",
                                        //   text1: "Hoàn tất",
                                        //   text2: `Đã hủy đơn hàng MS-${order.id}!`,
                                        // });
                                        simpleToast.show(
                                          `Đã hủy đơn hàng MS-${order.id}!`,
                                          {
                                            type: "info",
                                            duration: 1500,
                                          }
                                        );
                                        setCacheOrderList(
                                          cacheOrderList.map((item) =>
                                            item.id != order.id
                                              ? item
                                              : {
                                                  ...order,
                                                  status: OrderStatus.Cancelled,
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
                                                    // const toast = Toast.show({
                                                    //   type: "info",
                                                    //   text1: "Hoàn tất",
                                                    //   text2: `Đã hủy đơn hàng MS-${order.id}!`,
                                                    // });
                                                    simpleToast.show(
                                                      `Đã hủy đơn hàng MS-${order.id}!`,
                                                      {
                                                        type: "info",
                                                        duration: 1500,
                                                      }
                                                    );
                                                    // Alert.alert(
                                                    //   "Hoàn tất",
                                                    //   `Đã hủy đơn hàng MS-${order.id}!`
                                                    // );
                                                    setCacheOrderList(
                                                      cacheOrderList.map(
                                                        (item) =>
                                                          item.id != order.id
                                                            ? item
                                                            : {
                                                                ...order,
                                                                status:
                                                                  OrderStatus.Cancelled,
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
                                                      error?.response?.data
                                                        ?.error?.message ||
                                                        "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                                                    );
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
                                          error?.response?.data?.error
                                            ?.message ||
                                            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                                        );
                                      },
                                      false
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
                              orderFetchRefetch();
                              Alert.alert(
                                "Oops!",
                                "Đã quá thời gian để thực hiện thao tác này!"
                              );
                              return false;
                            }
                            // setOrderDetailId(order.id);
                            // globalOrderDetailState.setId(order.id);
                            // globalOrderDetailState.setIsActionsShowing(true);
                            setOrder(order);
                            setIsOpenOrderAssign(true);
                          }}
                          // className="bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                          className="bg-white border-[#7dd3fc] bg-[#7dd3fc] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                        >
                          <Text className="text-[13.5px]">
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
                    {formatDate(query.intendedReceiveDate)}
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
                      date={dayjs(globalTimeRangeState.date).toDate()}
                      onChange={(params) => {
                        if (params.date) {
                          globalTimeRangeState.setDate(
                            dayjs(params.date).toDate()
                          );
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
                      containerStyleClasses="mt-5 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold z-10"
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
            containerStyleClasses="mt-5 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-primary font-semibold z-10"
            // iconLeft={
            //   <Ionicons name="filter-outline" size={21} color="white" />
            // }
            textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
          />
        </View>
      </BottomSheet>
      {/* <BottomSheet modalProps={{}} isVisible={isDetailBottomSheetVisible}>
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
      </BottomSheet> */}
      <OrderDetailBottomSheet />
      {/* <Toast position="bottom" /> */}
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

const styleAssignModal = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "84%",
    height: "70%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
  },
});
