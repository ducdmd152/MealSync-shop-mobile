import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Searchbar, TouchableRipple } from "react-native-paper";
import Collapsible from "react-native-collapsible";
import { Tab } from "react-native-elements";
import MenuMainItems from "@/components/menu/MenuMainItems";
import MenuGroupOptions from "@/components/menu/MenuGroupOptions";
import useCounterState from "@/hooks/states/useCounterState";
import usePathState from "@/hooks/states/usePathState";
import PagingRequestQuery from "@/types/queries/PagingRequestQuery";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { FetchOnlyListResponse } from "@/types/responses/FetchResponse";
import { OperatingSlotModel } from "@/types/models/OperatingSlotModel";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { BottomSheet } from "@rneui/themed";
import { BlurView } from "expo-blur";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
import useTimeRangeState from "@/hooks/states/useTimeRangeState";
import TimeRangeSelect from "@/components/common/TimeRangeSelect";
import DeliveryFrameList from "@/components/delivery-package/DeliveryFrameList";
import MyDeliveryPackageList from "@/components/delivery-package/MyDeliveryPackageList";
interface DeliveryPackageFetchQuery extends PagingRequestQuery {
  status: number[];
  id: string;
  startTime: number;
  endTime: number;
  intendedRecieveDate: string;
}
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
const DeliveryPackage = () => {
  const globalTimeRangeState = useTimeRangeState();
  const [isFilterBottomSheetVisible, setIsFilterBottomSheetVisible] =
    useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isRangePickerVisible, setRangePickerVisibility] = useState(false);
  const {
    data: operatingSlots,
    isLoading: isOperatingSlotsLoading,
    error: operatingSlotsError,
    refetch: operatingSlotsRefetch,
    isRefetching: isOperatingSlotsRefetching,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.OPERATING_SLOT_LIST.concat([
      "delivery-package-page",
    ]),
    (): Promise<FetchOnlyListResponse<OperatingSlotModel>> =>
      apiClient
        .get(endpoints.OPERATING_SLOT_LIST)
        .then((response) => response.data),
    []
  );
  const [query, setQuery] = useState<DeliveryPackageFetchQuery>({
    status: [0],
    id: "",
    pageIndex: 1,
    pageSize: 100_000_000,
    startTime: globalTimeRangeState.startTime,
    endTime: globalTimeRangeState.endTime,
    intendedRecieveDate: new Date()
      .toLocaleDateString("sv-SE")
      .replace(/-/g, "/"),
  } as DeliveryPackageFetchQuery);
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
      intendedRecieveDate: dayjs(globalTimeRangeState.date).format(
        "YYYY/MM/DD"
      ),
      startTime: globalTimeRangeState.startTime,
      endTime: globalTimeRangeState.endTime,
    });
  }, [globalTimeRangeState]);

  const [index, setIndex] = useState(0);
  const deliveryPackageIndex = usePathState(
    (state) => state.deliveryPackageIndex
  );
  const setDeliveryPackageIndex = usePathState(
    (state) => state.setDeliveryPackageIndex
  );
  useEffect(() => {
    if (index != deliveryPackageIndex) setIndex(deliveryPackageIndex);
  }, [deliveryPackageIndex]);
  return (
    <View className="w-full h-full bg-white text-black p-2 relative">
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
                      date={globalTimeRangeState.date}
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
      <View className="p-2 pb-0">
        <View className="flex-row items-center justify-center border-2 border-gray-200 rounded-md">
          <CustomButton
            title="Các khung đã tạo"
            handlePress={() => {
              setIndex(0);
            }}
            containerStyleClasses={`flex-1 px-2  h-[40px] rounded-md ${
              index == 0 ? "bg-primary-100" : "bg-white"
            }`}
            textStyleClasses={`text-sm ${index == 0 ? "text-white" : ""}`}
          />
          <View className="w-[4px]"></View>
          <CustomButton
            title="Gói giao của bạn"
            handlePress={() => {
              setIndex(1);
            }}
            containerStyleClasses={`flex-1 px-2  h-[40px] rounded-md ${
              index == 1 ? "bg-primary-100" : "bg-white"
            }`}
            textStyleClasses={`text-sm ${index == 1 ? "text-white" : ""}`}
          />
        </View>
      </View>
      {index == 0 ? (
        <DeliveryFrameList beforeGo={() => setDeliveryPackageIndex(index)} />
      ) : (
        <MyDeliveryPackageList
          beforeGo={() => setDeliveryPackageIndex(index)}
        />
      )}
    </View>
  );
};

export default DeliveryPackage;

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
