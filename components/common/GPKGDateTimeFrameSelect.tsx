import React, { useEffect, useRef, useState } from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import ScrollPicker, {
  ScrollPickerHandle,
} from "react-native-wheel-scrollview-picker";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import FetchResponse, {
  FetchOnlyListResponse,
  FetchResponseValue,
  FetchValueResponse,
} from "@/types/responses/FetchResponse";
import { OperatingSlotModel } from "@/types/models/OperatingSlotModel";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { useFocusEffect } from "expo-router";
import utilService from "@/services/util-service";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Searchbar,
  TouchableRipple,
} from "react-native-paper";
import Collapsible from "react-native-collapsible";
import { Tab } from "react-native-elements";
import MenuMainItems from "@/components/menu/MenuMainItems";
import MenuGroupOptions from "@/components/menu/MenuGroupOptions";
import useCounterState from "@/hooks/states/useCounterState";
import usePathState from "@/hooks/states/usePathState";
import PagingRequestQuery from "@/types/queries/PagingRequestQuery";

import { BottomSheet } from "@rneui/themed";
import { BlurView } from "expo-blur";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";
import useTimeRangeState from "@/hooks/states/useTimeRangeState";
import TimeRangeSelect from "@/components/common/TimeRangeSelect";
import DeliveryFrameList from "@/components/delivery-package/DeliveryFrameList";
import MyDeliveryPackageList from "@/components/delivery-package/MyDeliveryPackageList";
import sessionService from "@/services/session-service";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import { UseQueryResult } from "@tanstack/react-query";
export interface GPKGQuery {
  startTime: number;
  endTime: number;
  intendedRecieveDate: string;
}
interface GPKG {
  startTime: number;
  endTime: number;
  isCreated: boolean;
  numberOfOrder: boolean;
}
interface GPKGListValueOfResponse {
  totalOrder: number;
  timeFrames: GPKG[];
}

interface Props {
  setOrderFetchResult: (
    result: UseQueryResult<FetchResponse<OrderFetchModel>, Error>
  ) => void;
}
const GPKGDateTimeFrameSelect = ({ setOrderFetchResult }: Props) => {
  // (async () => {
  //   console.log(await sessionService.getAuthToken());
  // })();
  const refFrameSelect = useRef<ScrollPickerHandle>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [isFramePickerVisible, setFramePickerVisibility] = useState(false);
  const [isAnyUnCreatedFrame, setIsAnyUnCreatedFrame] = useState(true);
  const [query, setQuery] = useState<GPKGQuery>({
    startTime: 0,
    endTime: 30,
    intendedRecieveDate: new Date()
      .toLocaleDateString("sv-SE")
      .replace(/-/g, "/"),
  } as GPKGQuery);
  const {
    data: gPKGFrameListData,
    isLoading: isGPKGFrameListLoading,
    error: gPKGFrameListError,
    refetch: gPKGFrameListRefetch,
    isRefetching: isGPKGFrameListRefetching,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.UNCREATED_GPKG_FRAME_LIST,
    (): Promise<FetchValueResponse<GPKGListValueOfResponse>> =>
      apiClient
        .get(
          endpoints.UNCREATED_GPKG_FRAME_LIST +
            "?IntendedRecieveDate=" +
            query.intendedRecieveDate
        )
        .then((response) => response.data),
    []
  );
  const [frames, setFrames] = useState<GPKG[]>([]);
  useEffect(() => {
    if (!isGPKGFrameListLoading && !isGPKGFrameListRefetching) {
      setFrames(
        gPKGFrameListData?.value.timeFrames.filter((item) => !item.isCreated) ||
          []
      );
      if (
        isAnyUnCreatedFrame !=
        (gPKGFrameListData?.value.timeFrames.filter((item) => !item.isCreated)
          .length != undefined &&
          gPKGFrameListData?.value.timeFrames.filter((item) => !item.isCreated)
            .length > 0)
      ) {
        setIsAnyUnCreatedFrame(
          gPKGFrameListData?.value.timeFrames.filter((item) => !item.isCreated)
            .length != undefined &&
            gPKGFrameListData?.value.timeFrames.filter(
              (item) => !item.isCreated
            ).length > 0
        );
      }
      handleFrameChange(0);
    }
  }, [gPKGFrameListData?.value]);
  useFocusEffect(
    React.useCallback(() => {
      gPKGFrameListRefetch();
    }, [])
  );

  const handleFrameChange = (index: number) => {
    const frames =
      gPKGFrameListData?.value.timeFrames.filter((item) => !item.isCreated) ||
      [];
    if (frames.length == 0) return;
    refFrameSelect.current && refFrameSelect.current.scrollToTargetIndex(index);
    setSelectedFrameIndex(index);
    setQuery({
      ...query,
      startTime: frames[index].startTime,
      endTime: frames[index].endTime,
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      gPKGFrameListRefetch();
    }, [])
  );

  console.log("gPKGFrameListData: ", frames);
  const frameSelect = (
    <View className="items-center justify-center  overflow-hidden">
      <Text className="mb-2 text-center">
        Các khung giờ chưa tạo bất kì phân công hàng nào trong ngày{" "}
        {utilService.formatDateDdMmYyyy(query.intendedRecieveDate)}
      </Text>
      <View className="w-full h-[100]">
        <ScrollPicker
          ref={refFrameSelect}
          wrapperHeight={100}
          dataSource={frames.map(
            (range) => range.startTime * 10000 + range.endTime
          )}
          selectedIndex={selectedFrameIndex}
          renderItem={(item, index) => {
            return (
              <Text
                className={`text-lg text-gray-600 ${
                  index == selectedFrameIndex && "font-semibold text-gray-800 "
                }`}
              >
                {utilService.formatTime(Math.floor(item / 10000)) +
                  " - " +
                  utilService.formatTime(item % 10000)}
              </Text>
            );
          }}
          onValueChange={(item, selectedIndex) => {
            handleFrameChange(selectedIndex);
          }}
        />
      </View>
    </View>
  );
  return (
    <View>
      <View className="p-4 bg-white">
        <View className="flex-row gap-x-1">
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
                  {utilService.formatDateDdMmYyyy(query.intendedRecieveDate)}
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
              <BlurView intensity={50} style={styleTimePicker.modalBackground}>
                <View style={styleTimePicker.modalContent}>
                  <DateTimePicker
                    minDate={
                      new Date(new Date().setDate(new Date().getDate() - 1))
                    }
                    maxDate={
                      new Date(new Date().setDate(new Date().getDate() + 1))
                    }
                    mode="single"
                    locale="vi-VN"
                    date={dayjs(query.intendedRecieveDate).toDate()}
                    onChange={(params) => {
                      if (params.date) {
                        console.log("params.date: ", params.date);
                        setQuery({
                          ...query,
                          intendedRecieveDate:
                            utilService.formatDateTimeToYyyyMmDd(
                              dayjs(query.intendedRecieveDate).toISOString()
                            ),
                        });
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
              Khung giờ
            </Text>
            <TouchableRipple
              disabled={!isAnyUnCreatedFrame}
              onPress={() => {
                setFramePickerVisibility(true);
              }}
              className="border-2 border-gray-300 p-2 rounded-md"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-black mx-2 text-lg">
                  {isGPKGFrameListLoading || isGPKGFrameListRefetching ? (
                    <ActivityIndicator animating={true} color="#FCF450" />
                  ) : isAnyUnCreatedFrame ? (
                    utilService.formatTime(query.startTime) +
                    " - " +
                    utilService.formatTime(query.endTime)
                  ) : (
                    "-- -- : -- --"
                  )}
                </Text>
                <Ionicons name="create-outline" size={21} color="gray-600" />
              </View>
            </TouchableRipple>
            <Modal
              animationType="slide"
              transparent={true}
              visible={isFramePickerVisible}
              onRequestClose={() => {
                setFramePickerVisibility(false);
              }}
            >
              <BlurView intensity={50} style={styleTimePicker.modalBackground}>
                <View style={styleTimePicker.modalContent}>
                  <TouchableOpacity
                    className="items-center"
                    onPress={() => setFramePickerVisibility(false)}
                  >
                    <Ionicons
                      name="chevron-down-outline"
                      size={24}
                      color="gray"
                    />
                  </TouchableOpacity>
                  {frameSelect}
                  <CustomButton
                    title="Hoàn tất"
                    handlePress={() => {
                      setFramePickerVisibility(false);
                    }}
                    containerStyleClasses="mt-5 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-psemibold z-10"
                    textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
                  />
                </View>
              </BlurView>
            </Modal>
          </View>
        </View>
        {!isAnyUnCreatedFrame &&
          (gPKGFrameListData?.value.totalOrder == 0 ? (
            <View>
              <Text>Chưa khung giờ nào nhận đơn hàng vào hôm nay</Text>
              <TouchableOpacity>
                <Text>Trở về</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text>Tải lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text>Các khung giờ có đơn hàng đều đã được tạo phân công</Text>
              <TouchableOpacity>
                <Text>Đi đến các khung đã tạo</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text>Tải lại</Text>
              </TouchableOpacity>
            </View>
          ))}
      </View>
    </View>
  );
};

export default GPKGDateTimeFrameSelect;
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
