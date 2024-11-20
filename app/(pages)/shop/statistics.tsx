import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import CONSTANTS from "@/constants/data";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import utilService from "@/services/util-service";
import { FoodStatus } from "@/types/models/FoodModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { TouchableRipple } from "react-native-paper";
import DateTimePicker from "react-native-ui-datepicker";
interface FoodStatistics {
  id: number;
  name: string;
  totalOrders: number;
  imageUrl: string;
  status: number;
}

interface ShopStatisticsModel {
  startDate: string;
  endDate: string;
  totalOrderDone: number;
  totalOrderInProcess: number;
  successfulOrderPercentage: number;
  revenue: number;
  totalSuccess: number;
  totalFailOrRefund: number;
  totalCancelOrReject: number;
  foods: FoodStatistics[];
}
const splitFoodName = (name: string, maxLengthOfLine: number) => {
  const firstLine =
    name.length > maxLengthOfLine ? name.slice(0, maxLengthOfLine) : name;
  const secondLine =
    name.length > maxLengthOfLine ? name.slice(maxLengthOfLine) : null;
  return { firstLine, secondLine };
};

const Statistics = () => {
  const [fromDate, setFromDate] = useState(dayjs(dayjs("2024-01-01")));
  const [toDate, setToDate] = useState(dayjs(Date.now()));
  const [isFromDatePickerVisible, setFromDatePickerVisibility] =
    useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);

  const toggleFromDatePicker = () => {
    setFromDatePickerVisibility(!isFromDatePickerVisible);
  };
  const toggleToDatePicker = () => {
    setToDatePickerVisibility(!isToDatePickerVisible);
  };

  const statistics = useFetchWithRQWithFetchFunc(
    [endpoints.SHOP_STATISTICS].concat(["statistics-page"]),
    async (): Promise<FetchValueResponse<ShopStatisticsModel>> =>
      apiClient
        .get(endpoints.SHOP_STATISTICS, {
          headers: {
            // Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            startDate: fromDate.toISOString(),
            endDate: toDate.add(1, "day").toISOString(),
          },
        })
        .then((response) => response.data),
    [fromDate, toDate]
  );
  // useEffect(() => {
  //   console.log(
  //     "fromDate: ",
  //     fromDate,
  //     " | toDate: ",
  //     toDate.add(1, "day").toISOString()
  //   );
  // }, [fromDate, toDate]);
  useFocusEffect(
    React.useCallback(() => {
      statistics.refetch();
    }, [])
  );
  return (
    <PageLayoutWrapper
      refreshControl={
        <RefreshControl
          tintColor={"#FCF450"}
          onRefresh={() => {
            statistics.refetch();
          }}
          refreshing={statistics.isRefetching}
        />
      }
    >
      <View className="w-full  bg-gray-000 flex-col rounded-xl items-center justify-center mb-3 border-green-100 border-2 py-8 gap-y-2">
        <View className="justify-center items-center flex-row">
          <Text className="font-semibold text-[48px] text-green-500 ">
            {statistics.data?.value.successfulOrderPercentage}
          </Text>
          <Text className="text-[32px] text-green-500">%</Text>
        </View>
        <Text className="text-center text-lg font-bold text-green-400 ml-[-4px]">
          đơn hàng thành công
        </Text>
      </View>
      {/* TIME FILTERING */}
      <View className="flex-row justify-around mb-4 mx-2">
        {/* Date:To */}
        <View className="flex-col w-1/2 px-2">
          <Text className="text-gray-500  text-sm">Từ</Text>
          <TouchableRipple
            onPress={toggleFromDatePicker}
            className="border-2 border-gray-300 p-2 rounded-md"
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-black mx-2 text-lg">
                {fromDate.format("DD/MM/YYYY")}
              </Text>
              <Ionicons name="create-outline" size={21} color="gray-600" />
            </View>
          </TouchableRipple>
        </View>

        {/* Date:To */}
        <View className="flex-col w-1/2 px-2">
          <Text className="text-gray-500  text-sm">Đến</Text>
          <TouchableRipple
            onPress={toggleToDatePicker}
            className="border-2 border-gray-300 p-2 rounded-md"
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-black mx-2 text-lg">
                {toDate.format("DD/MM/YYYY")}
              </Text>
              <Ionicons name="create-outline" size={21} color="gray-600" />
            </View>
          </TouchableRipple>
        </View>
        {/* From Date Picker Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isFromDatePickerVisible}
          onRequestClose={() => setFromDatePickerVisibility(false)}
        >
          <BlurView intensity={50} style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <DateTimePicker
                minDate={dayjs("2024-01-01").toDate()}
                maxDate={toDate.toDate()}
                mode="single"
                startDate={fromDate.toDate()}
                endDate={toDate.toDate()}
                locale="vi-VN"
                date={fromDate.toDate()}
                onChange={(params) => {
                  setFromDate(dayjs(params.date));
                  setFromDatePickerVisibility(false);
                }}
              />
            </View>
          </BlurView>
        </Modal>

        {/* To Date Picker Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isToDatePickerVisible}
          onRequestClose={() => setToDatePickerVisibility(false)}
        >
          <BlurView intensity={50} style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <DateTimePicker
                minDate={fromDate.toDate()}
                maxDate={dayjs().toDate()}
                mode="single"
                startDate={fromDate.toDate()}
                endDate={toDate.toDate()}
                locale="vi-VN"
                date={toDate.toDate()}
                onChange={(params) => {
                  setToDate(dayjs(params.date));
                  setToDatePickerVisibility(false);
                }}
              />
            </View>
          </BlurView>
        </Modal>
      </View>
      {/* REVENUE */}
      <View className="w-full items-center p-2">
        {/* <View className="w-full flex-row justify-between items-center mb-3">
          <Text className="text-lg text-gray-600">Doanh thu</Text>
          <Text className="text-gray-600 opacity-85 italic pr-4">
            {"Tháng 9"}
          </Text>
        </View> */}
        <View className="w-full h-[80px] bg-gray-000 flex-col rounded-xl items-center justify-center mb-3 bg-yellow-100">
          <Text className="font-semibold">Doanh thu</Text>
          <Text className="text-center text-lg font-bold">
            {statistics.data?.value.revenue != undefined
              ? utilService.formatPrice(statistics.data?.value.revenue) + " đ"
              : "--------"}{" "}
          </Text>
        </View>
        <View className="w-full flex-row gap-2 items-between">
          <View className="flex-1 h-[80px]  bg-yellow-100 flex-col rounded-xl items-center justify-center p-1">
            <Text className="font-semibold text-green-500">
              {statistics.data?.value.totalSuccess}
            </Text>
            <Text className="text-center text-green-500">
              Đơn hàng {"\n"} thành công
            </Text>
          </View>
          <View className="flex-1 h-[80px]  bg-yellow-100  flex-col rounded-xl items-center justify-center p-1">
            <Text className="font-semibold text-red-500">
              {statistics.data?.value.totalFailOrRefund}
            </Text>
            <Text className="text-center text-red-500">
              Đơn hàng thất bại/hoàn tiền
            </Text>
          </View>
          <View className="flex-1 h-[80px] bg-yellow-100 rounded-xl items-center justify-center p-1 ">
            <Text className="font-semibold text-purple-500">
              {statistics.data?.value.totalCancelOrReject}
            </Text>
            <Text className="text-center text-purple-500">
              Đơn hàng {"\n"}hủy/từ chối
            </Text>
          </View>
        </View>
      </View>
      <View className="p-2 mt-2">
        <Text className="text-lg font-bold">Sản phẩm bán chạy</Text>
        <View className="gap-y-2 pb-[154px] mt-2">
          {!statistics.isFetching &&
            statistics.data?.value.foods.length == 0 && (
              <Text className="text-gray-600 text-center mt-[-12px]">
                Không có lượt bán nào trong khoảng này
              </Text>
            )}
          {statistics.data?.value.foods.map((food) => (
            <View
              key={food.id}
              className={`p-3 px-1 bg-white border-2 border-gray-300 rounded-lg ${
                food.status == FoodStatus.Deleted && "opacity-50"
              }`}
            >
              <View className="flex-row gap-x-2 items-start justify-between ">
                <View className="flex-1 flex-row justify-start items-center gap-2">
                  <Image
                    source={{
                      uri: food.imageUrl || CONSTANTS.url.pink,
                    }}
                    resizeMode="cover"
                    className="h-[32px] w-[40px] rounded-md opacity-85"
                  />
                  <View className="">
                    <Text
                      className="text-md w-[180px] font-semibold mt-[-2px] ml-[4px]"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {food.name}
                    </Text>
                    {/* <Text className="text-md italic text-gray-500 mt-[-2px]">
                      120.000đ
                    </Text> */}
                  </View>
                </View>

                <View className="flex-row gap-x-2 mr-1 items-start">
                  <Text className="bg-green-200 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded">
                    {food.totalOrders} lượt bán
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

const styles = StyleSheet.create({
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

export default Statistics;
