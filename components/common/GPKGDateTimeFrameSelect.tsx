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
import { Link, router, useFocusEffect } from "expo-router";
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
import OrderFetchModel, { OrderStatus } from "@/types/models/OrderFetchModel";
import { UseQueryResult } from "@tanstack/react-query";
import { GPKGQuery } from "@/app/(pages)/delivery-package-group/create";

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
  query: GPKGQuery;
  setQuery: (query: GPKGQuery) => void;
  isAnyUnCreatedFrame: boolean;
  setIsAnyUnCreatedFrame: (value: boolean) => void;
  setOrderFetchResult: (
    result: UseQueryResult<FetchResponse<OrderFetchModel>, Error>,
  ) => void;
  onSuggest: () => void;
}
const GPKGDateTimeFrameSelect = ({
  query,
  setQuery,
  isAnyUnCreatedFrame,
  setIsAnyUnCreatedFrame,
  setOrderFetchResult,
  onSuggest,
}: Props) => {
  // (async () => {
  //   console.log(await sessionService.getAuthToken());
  // })();
  const refFrameSelect = useRef<ScrollPickerHandle>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [isFramePickerVisible, setFramePickerVisibility] = useState(false);

  const [frames, setFrames] = useState<GPKG[]>([]);

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
            "?intendedReceiveDate=" +
            query.intendedReceiveDate,
        )
        .then((response) => response.data),
    [query],
  );

  const orderFetchResult = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.ORDER_LIST.concat(["gpkg-create-page"]),
    async (): Promise<FetchResponse<OrderFetchModel>> =>
      apiClient
        .get(
          endpoints.ORDER_LIST + `?status=${Number(OrderStatus.Preparing)}`,
          {
            headers: {
              Authorization: `Bearer ${await sessionService.getAuthToken()}`,
            },
            params: {
              ...query,
              id: "",
              phoneNumber: "",
              pageIndex: 1,
              pageSize: 100_000_000,
            },
          },
        )
        .then((response) => response.data),
    [query],
  );
  // console.log("orderFetchData: ", orderFetchData?.value.items);
  useEffect(() => {
    if (!isGPKGFrameListLoading && !isGPKGFrameListRefetching) {
      setFrames(
        gPKGFrameListData?.value.timeFrames.filter((item) => !item.isCreated) ||
          [],
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
              (item) => !item.isCreated,
            ).length > 0,
        );
      }
      handleFrameChange(0);
    }
  }, [gPKGFrameListData?.value]);
  useFocusEffect(
    React.useCallback(() => {
      gPKGFrameListRefetch();
    }, []),
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
  useEffect(() => {
    setOrderFetchResult(orderFetchResult);
  }, [orderFetchResult.isFetching]);
  useFocusEffect(
    React.useCallback(() => {
      gPKGFrameListRefetch();
    }, []),
  );
  // console.log("gPKGFrameListData: ", frames);
  const frameSelect = (
    <View className="items-center justify-center  overflow-hidden">
      <Text className="mb-2 text-center">
        Các khung giờ có đơn chưa tạo bất kì phân công hàng nào trong ngày{" "}
        {utilService.formatDateDdMmYyyy(query.intendedReceiveDate)}
      </Text>
      <View className="w-full h-[100]">
        <ScrollPicker
          ref={refFrameSelect}
          wrapperHeight={100}
          dataSource={frames.map(
            (range) => range.startTime * 10000 + range.endTime,
          )}
          selectedIndex={selectedFrameIndex}
          renderItem={(item, index) => {
            return (
              <Text
                className={`text-[18px] text-gray-600 ${
                  index == selectedFrameIndex && "font-bold text-gray-800 "
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
            <Text className="text-gray-500  text-sm absolute top-[-8px] bg-white z-10 left-5 ">
              Ngày
            </Text>
            <TouchableRipple
              onPress={() => {
                setDatePickerVisibility(true);
              }}
              className="border-2 border-gray-300 p-2 rounded-md"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-black mr-2 text-md">
                  {utilService.formatDateDdMmYyyy(query.intendedReceiveDate)}
                </Text>
                <Ionicons name="create-outline" size={18} color="gray-600" />
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
                    maxDate={new Date(new Date().setDate(new Date().getDate()))}
                    mode="single"
                    locale="vi-VN"
                    date={dayjs(query.intendedReceiveDate).toDate()}
                    onChange={(params) => {
                      if (params.date) {
                        setQuery({
                          ...query,
                          intendedReceiveDate:
                            utilService.formatDateTimeToYyyyMmDd(
                              params.date.toLocaleString(),
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
                <Text className="text-black mr-2 text-md">
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
                <Ionicons name="create-outline" size={18} color="gray-600" />
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
                    containerStyleClasses="mt-5 h-[48px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold z-10"
                    textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
                  />
                </View>
              </BlurView>
            </Modal>
          </View>
          <TouchableOpacity
            onPress={() => {
              onSuggest();
            }}
            className={` flex-row items-center rounded-md items-center justify-center px-[6px] py-[2.2px] bg-[#227B94] ${
              !isAnyUnCreatedFrame ? "opacity-50" : ""
            }`}
            disabled={!isAnyUnCreatedFrame}
          >
            <Text className="text-[10px] text-white text-center">
              Chia tự động
            </Text>
            {/* <Ionicons name="chevron-up-outline" size={14} color="white" /> */}
          </TouchableOpacity>
        </View>
        {(isGPKGFrameListLoading || isGPKGFrameListRefetching) && (
          <View className="mt-2">
            <ActivityIndicator animating={true} color="#FCF450" />
          </View>
        )}
        {!isAnyUnCreatedFrame && (
          <View className="items-center">
            <Text className="mt-3 text-center italic">
              Không khung giờ đang diễn ra hay sắp tới {"\n"} cần được tạo khung
              phân công giao hàng
            </Text>
            <View className="flex-row items-center gap-x-2">
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-[#227B94] text-[14px] font-semibold p-2">
                  Trở về
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  gPKGFrameListRefetch();
                }}
              >
                <Text className="text-secondary text-[14px] font-semibold p-2">
                  Tải lại
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
