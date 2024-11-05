import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native-elements";
import {
  ActivityIndicator,
  Searchbar,
  TouchableRipple,
} from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import DateTimePicker from "react-native-ui-datepicker";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { endpoints } from "@/services/api-services/api-service-instances";
import apiClient from "@/services/api-services/api-client";
import FetchResponse from "@/types/responses/FetchResponse";
import PromotionModel, {
  promotionStatuses,
} from "@/types/models/PromotionModel";
import sessionService from "@/services/session-service";
import { router, useFocusEffect } from "expo-router";
import CONSTANTS from "@/constants/data";
import usePromotionModelState from "@/hooks/states/usePromotionModelState";

const STATUSES = [
  { label: "Tất cả", value: 0 },
  { label: "Khả dụng", value: 1 },
  { label: "Đã tắt", value: 2 },
];

const Promotion = () => {
  const globalPromotionState = usePromotionModelState();
  const {
    startDate: fromDate,
    setStartDate: setFromDate,
    endDate: toDate,
    setEndDate: setToDate,
  } = globalPromotionState;
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState(0);
  // const [fromDate, setFromDate] = useState(dayjs(dayjs("2024-01-01")));
  // const [toDate, setToDate] = useState(dayjs(Date.now()));
  const [isFromDatePickerVisible, setFromDatePickerVisibility] =
    useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);

  const promotions = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.PROMOTION_LIST.concat(["gpkg-create-page"]),
    async (): Promise<FetchResponse<PromotionModel>> =>
      apiClient
        .get(endpoints.PROMOTION_LIST, {
          headers: {
            Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            status: status == 0 ? undefined : status,
            searchValue,
            startDate: fromDate.toISOString(),
            endDate: toDate.add(1, "day").toISOString(),
            pageIndex: 1,
            pageSize: 100_000_000,
          },
        })
        .then((response) => response.data),
    [searchValue, status, fromDate, toDate]
  );
  const toggleFromDatePicker = () => {
    setFromDatePickerVisibility(!isFromDatePickerVisible);
  };
  const toggleToDatePicker = () => {
    setToDatePickerVisibility(!isToDatePickerVisible);
  };
  console.log(promotions.error, promotions.data?.value.items);
  useFocusEffect(
    React.useCallback(() => {
      promotions.refetch();
    }, [])
  );
  return (
    <PageLayoutWrapper isScroll={false}>
      <CustomButton
        title="Thêm mới"
        handlePress={() => {
          router.push("/promotion/create");
        }}
        containerStyleClasses="h-[48px] px-4 bg-transparent border-0 border-gray-200 absolute bottom-8 right-5 bg-primary font-psemibold z-10"
        iconLeft={
          <Ionicons name="add-circle-outline" size={21} color="white" />
        }
        textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
      />
      <View className="w-full flex-1 bg-white text-black p-4 pb-0 relative">
        <View className="flex-1 gap-2 z-0">
          <View className="w-full">
            <Searchbar
              style={{
                height: 50,
              }}
              inputStyle={{ minHeight: 0 }}
              placeholder="Nhập tiêu đề khuyến mãi..."
              onChangeText={setSearchValue}
              value={searchValue}
            />
          </View>

          {/* <ScrollView
            style={{ width: "100%", flexShrink: 0 }}
            horizontal={true}
          > */}
          <View className="w-full">
            <View className="w-full flex-row gap-x-2 items-center justify-between pb-2 px-2">
              {STATUSES.map((sts) => (
                <TouchableOpacity
                  key={sts.value}
                  className={`flex-1 bg-gray-100 rounded-lg py-2   ${
                    sts.value == status ? "bg-secondary" : "bg-gray-100"
                  }`}
                  onPress={() => {
                    setStatus(sts.value);
                  }}
                >
                  <Text className="text-center">{sts.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* </ScrollView> */}

          {/* TIME FILTERING */}
          <View className="flex-row justify-between mb-1">
            {/* Date:To */}
            <View className="flex-col flex-1 px-1 relative">
              <Text className="text-gray-500  text-sm absolute top-[-8px] bg-white z-10 left-5">
                Khoảng từ
              </Text>
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
            <View className="flex-col flex-1 px-1 relative">
              <Text className="text-gray-500  text-sm absolute top-[-8px] bg-white z-10 left-5">
                Đến hết
              </Text>
              <TouchableRipple
                onPress={toggleToDatePicker}
                className="border-2 border-gray-300 p-2 rounded-md"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-black mx-2 text-lg">
                    {toDate.local().format("DD/MM/YYYY")}
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
              <BlurView intensity={50} style={styleTimePicker.modalBackground}>
                <View style={styleTimePicker.modalContent}>
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
              <BlurView intensity={50} style={styleTimePicker.modalBackground}>
                <View style={styleTimePicker.modalContent}>
                  <DateTimePicker
                    minDate={fromDate.toDate()}
                    maxDate={dayjs("2030-01-01").toDate()}
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
          {promotions.isFetching && (
            <ActivityIndicator animating={true} color="#FCF450" />
          )}
          {!promotions.isFetching && !promotions.data?.value.items?.length && (
            <Text className="text-gray-600 text-center mt-[-12px]">
              Không tìm thấy khuyến mãi tương ứng
            </Text>
          )}
          <ScrollView style={{ width: "100%", flexGrow: 1 }}>
            <View className="gap-y-2 pb-[154px]">
              {(promotions.data?.value.items || []).map((promotion, index) => (
                <TouchableOpacity
                  onPress={() => {
                    globalPromotionState.setPromotion(promotion);
                    router.push("/promotion/details");
                  }}
                  key={promotion.id}
                  className="p-4 pt-3 bg-white drop-shadow-md rounded-lg shadow"
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-row flex-1 justify-start items-start gap-x-2">
                      <View className="self-stretch">
                        <Image
                          source={{
                            uri:
                              promotion.bannerUrl ||
                              CONSTANTS.url.noImageAvailable,
                          }}
                          resizeMode="cover"
                          className="h-[50px] w-[62px] rounded-md opacity-85"
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-[12.5px] font-psemibold mt-[-2px]"
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {promotion.title}
                        </Text>
                        <Text className="text-[12px] italic text-gray-500 ">
                          {dayjs(promotion.startDate).format("DD/MM/YY")} -{" "}
                          {dayjs(promotion.endDate).format("DD/MM/YY")}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="bg-blue-100 text-gray-800 text-[12px] font-medium me-2 px-2.5 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          promotion.status == 1 ? "#86efac" : "#e5e5e5",
                      }}
                    >
                      {promotionStatuses.find(
                        (item) => item.key === promotion.status
                      )?.label || "------"}
                    </Text>
                  </View>
                  <View className="flex-row justify-end gap-2 pt-2">
                    <TouchableOpacity
                      onPress={() => {
                        globalPromotionState.setPromotion(promotion);
                        router.push("/promotion/update");
                      }}
                      className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                    >
                      <Text className="text-[13.5px] text-white">
                        Chỉnh sửa
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        globalPromotionState.setPromotion(promotion);
                        router.push("/promotion/details");
                      }}
                      className="bg-white border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                    >
                      <Text className="text-[13.5px]">Chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

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

export default Promotion;
