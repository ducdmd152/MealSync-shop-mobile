import CustomButton from "@/components/custom/CustomButton";
import CONSTANTS from "@/constants/data";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import useGlobalWithdrawalState from "@/hooks/states/useGlobalWithdrawalState";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import sessionService from "@/services/session-service";
import utilService from "@/services/util-service";
import {
  WITHDRAW_STATUSES_FILTER,
  WithdrawalModel,
  WithdrawalStatus,
  withdrawalStatuses,
} from "@/types/models/WithdrawalModel";
import FetchResponse from "@/types/responses/FetchResponse";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TouchableRipple } from "react-native-paper";
import DateTimePicker from "react-native-ui-datepicker";

const Withdrawal = () => {
  const globalWithdrawalState = useGlobalWithdrawalState();
  const {
    startDate: fromDate,
    setStartDate: setFromDate,
    endDate: toDate,
    setEndDate: setToDate,
  } = globalWithdrawalState;
  const [isFromDatePickerVisible, setFromDatePickerVisibility] =
    useState(false);

  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
  const fetch = useFetchWithRQWithFetchFunc(
    [endpoints.WITHDRAWAL_LIST].concat(["withdrawal-page"]),
    async (): Promise<FetchResponse<WithdrawalModel>> =>
      apiClient
        .get(
          endpoints.WITHDRAWAL_LIST +
            "?" +
            globalWithdrawalState.statuses
              .map((item) => "status=" + item)
              .join("&"),
          {
            headers: {
              Authorization: `Bearer ${await sessionService.getAuthToken()}`,
            },
            params: {
              startDate: fromDate.toISOString(),
              endDate: toDate.add(1, "day").toISOString(),
              pageIndex: 1,
              pageSize: 100_000_000,
            },
          }
        )
        .then((response) => response.data),
    [fromDate, toDate, globalWithdrawalState.statuses]
  );
  const toggleFromDatePicker = () => {
    setFromDatePickerVisibility(!isFromDatePickerVisible);
  };
  const toggleToDatePicker = () => {
    setToDatePickerVisibility(!isToDatePickerVisible);
  };
  // console.log(promotions.error, promotions.data?.value.items);
  useFocusEffect(
    React.useCallback(() => {
      fetch.refetch();
      globalWithdrawalState.setOnAfterCancelCompleted(() => fetch.refetch());
    }, [])
  );
  return (
    <View className="w-full h-full bg-white text-black p-4 relative">
      <CustomButton
        title="Tạo yêu cầu"
        handlePress={() => {
          fetch
            .refetch()
            .then(() => {
              const request = (fetch.data?.value.items || []).find(
                (item) =>
                  item.status === WithdrawalStatus.Pending ||
                  item.status === WithdrawalStatus.UnderReview
              );

              if (request) {
                Alert.alert(
                  "Oops!",
                  request.status === WithdrawalStatus.Pending
                    ? "Bạn đang có 1 yêu cầu đang chờ, vui lòng hủy yêu cầu hoặc chờ đợi đến khi yêu cầu hoàn tất xử lí"
                    : "Bạn đang có 1 yêu cầu đang xem xét, bạn có thể tạo mới yêu cầu khi yêu cầu hiện tại hoàn tất xử lí"
                );
              } else {
                router.push("/withdrawal/create");
              }
            })
            .catch((error: any) => {
              Alert.alert(
                "Oops!",
                error?.response?.data?.error?.message ||
                  "Yêu cầu bị từ chối, vui lòng thử lại sau!"
              );
            });
        }}
        containerStyleClasses="h-[48px] px-4 bg-transparent border-0 border-gray-200 absolute bottom-8 right-5 bg-primary font-semibold z-10"
        iconLeft={
          <Ionicons name="add-circle-outline" size={21} color="white" />
        }
        textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
      />
      <View className="w-full flex-1 bg-white text-black pb-0 relative">
        <View className="flex-1 gap-2">
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
                    maxDate={new Date()}
                    mode="single"
                    locale="vi-VN"
                    date={fromDate.toDate()}
                    onChange={(params) => {
                      setFromDate(dayjs(params.date));
                      setFromDatePickerVisibility(false);
                      if (dayjs(params.date).toDate() > toDate.toDate()) {
                        setToDate(dayjs(params.date));
                      }
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
                    minDate={dayjs("2024-01-01").toDate()}
                    maxDate={new Date()}
                    mode="single"
                    locale="vi-VN"
                    date={toDate.toDate()}
                    onChange={(params) => {
                      setToDate(dayjs(params.date));
                      setToDatePickerVisibility(false);
                      if (dayjs(params.date).toDate() < fromDate.toDate()) {
                        setFromDate(dayjs(params.date));
                      }
                    }}
                  />
                </View>
              </BlurView>
            </Modal>
          </View>
          <View className="w-full flex-row items-center justify-between pb-2 pr-2">
            {WITHDRAW_STATUSES_FILTER.map((sts) => (
              <TouchableOpacity
                key={sts.label}
                className={`flex-1 mx-[3px] bg-gray-100 rounded-lg py-2   ${
                  sts.value == globalWithdrawalState.statuses
                    ? "bg-secondary"
                    : "bg-gray-100"
                }`}
                onPress={() => {
                  globalWithdrawalState.setStatuses(sts.value);
                }}
              >
                <Text className="text-center">{sts.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {!fetch.isFetching && !fetch.data?.value.items?.length && (
            <Text className="text-gray-600 text-center mt-[-12px]">
              Không tìm thấy yêu cầu rút tiền nào
            </Text>
          )}
          <ScrollView
            style={{ width: "100%", flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                tintColor={"#FCF450"}
                onRefresh={() => {
                  fetch.refetch();
                }}
                refreshing={fetch.isFetching}
              />
            }
          >
            <View className="gap-y-2 pb-[72px]">
              {(fetch.data?.value.items || []).map((draw, index) => (
                <TouchableOpacity
                  onPress={() => {
                    globalWithdrawalState.setWithdrawal(draw);
                    globalWithdrawalState.setIsDetailsModalVisible(true);
                  }}
                  key={draw.id}
                  className="p-4 pt-3 bg-white drop-shadow-md rounded-lg shadow"
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-row flex-1 justify-start items-start gap-x-2">
                      <View className="self-center">
                        <Image
                          source={{
                            uri: CONSTANTS.url.withdrawalRequest,
                          }}
                          resizeMode="contain"
                          className="h-[32px] w-[40px] opacity-85"
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-[12.5px] font-semibold mt-[-2px]"
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          RQ-{draw.id}
                        </Text>
                        <Text className="text-[11px] italic text-gray-500 ">
                          Đã tạo vào{" "}
                          {dayjs(draw.createdDate)
                            .local()
                            .format("HH:mm DD/MM/YYYY")}{" "}
                        </Text>
                        <Text className="text-[11px] italic text-gray-500 ">
                          Số tiền yêu cầu:{" "}
                          {utilService.formatPrice(draw.amount)}
                          {"₫"}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="bg-blue-100 text-gray-800 text-[12px] font-medium me-2 px-2.5 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          withdrawalStatuses.find(
                            (item) => item.key === draw.status
                          )?.bgColor || "#e5e5e5",
                      }}
                    >
                      {withdrawalStatuses.find(
                        (item) => item.key === draw.status
                      )?.label || "------"}
                    </Text>
                  </View>
                  {/* <View className="flex-row justify-end gap-2 pt-2">
                    <TouchableOpacity
                      onPress={() => {
                        globalWithdrawalState.setWithdrawal(draw);
                        // router.push("/promotion/update");
                      }}
                      className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                    >
                      <Text className="text-[13.5px] text-white">
                        Chỉnh sửa
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        globalWithdrawalState.setWithdrawal(draw);
                        router.push("/promotion/details");
                      }}
                      className="bg-white border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                    >
                      <Text className="text-[13.5px]">Chi tiết</Text>
                    </TouchableOpacity>
                  </View> */}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default Withdrawal;
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
