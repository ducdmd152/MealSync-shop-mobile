import { View, Text, Image, Dimensions, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useTimeRangeState from "@/hooks/states/useTimeRangeState";
import { FrameDateTime } from "@/types/models/TimeModel";
import {
  DeliveryPackageModel,
  DeliveryPackageStatus,
  OwnDeliveryPackageModel,
} from "@/types/models/DeliveryPackageModel";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { endpoints } from "@/services/api-services/api-service-instances";
import apiClient from "@/services/api-services/api-client";
import { FetchOnlyListResponse } from "@/types/responses/FetchResponse";
import dayjs from "dayjs";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import sessionService from "@/services/session-service";
import utilService from "@/services/util-service";
import { getOrderStatusDescription } from "@/types/models/OrderFetchModel";
import { useFocusEffect } from "expo-router";
import useGlobalMyPKGDetailsState from "@/hooks/states/useGlobalPKGDetailsState";
import { BottomSheet } from "@rneui/themed";
import DeliveryFrameDetail from "./DeliveryFrameDetail";
import { Ionicons } from "@expo/vector-icons";
import DeliveryPKGDetail from "./DeliveryPKGDetail";
const detailBottomHeight = Dimensions.get("window").height - 100;
interface Query extends FrameDateTime {
  status: number[];
}
const STATUSES = [
  {
    value: [
      DeliveryPackageStatus.Pending,
      DeliveryPackageStatus.OnGoing,
      DeliveryPackageStatus.Completed,
    ],
    label: "Tất cả",
  },
  { value: [DeliveryPackageStatus.Pending], label: "Chưa giao" },
  { value: [DeliveryPackageStatus.OnGoing], label: "Đang giao" },
  { value: [DeliveryPackageStatus.Completed], label: "Hoàn thành" },
];
const MyDeliveryPackageList = ({ beforeGo }: { beforeGo: () => void }) => {
  const isFocused = useRef(false);
  const globalTimeRangeFilter = useTimeRangeState();
  const globalMyGKGDetailsState = useGlobalMyPKGDetailsState();
  const [isDetailBottomSheetVisible, setIsDetailBottomSheetVisible] =
    useState(false);
  const [detailBottomSheetDisplay, setDetailBottomSheetDisplay] =
    useState(true);
  const [statuses, setStatuses] = useState<Number[]>(STATUSES[0].value);
  const myPkgFetchResult = useFetchWithRQWithFetchFunc(
    [endpoints.MY_DELIVERY_PACKAGE_LIST],
    async (): Promise<FetchOnlyListResponse<OwnDeliveryPackageModel>> =>
      apiClient
        .get(
          endpoints.MY_DELIVERY_PACKAGE_LIST +
            `?${statuses.map((sts) => `status=${sts}`).join("&")}`,
          {
            params: {
              startTime: globalTimeRangeFilter.startTime,
              endTime: globalTimeRangeFilter.endTime,
              intendedReceiveDate: dayjs(globalTimeRangeFilter.date).format(
                "YYYY/MM/DD"
              ),
            },
          }
        )
        .then((response) => response.data),
    [statuses]
  );
  useFocusEffect(
    useCallback(() => {
      myPkgFetchResult.refetch();
      isFocused.current = true;
      return () => {
        isFocused.current = false;
      };
    }, [])
  );
  useEffect(() => {
    if (isFocused.current) {
      myPkgFetchResult.refetch();
    }
  }, [globalTimeRangeFilter]);
  return (
    <View className="w-full flex-1 bg-white text-black p-4 ">
      <View className="w-full flex-row items-center justify-between pb-2">
        {STATUSES.map((sts) => (
          <TouchableOpacity
            key={sts.label}
            className={`mx-[3px] bg-gray-100 rounded-lg px-3 py-2   ${
              sts.value == statuses ? "bg-secondary" : "bg-gray-100"
            }`}
            onPress={() => {
              setStatuses(sts.value);
            }}
          >
            <Text className="text-center text-[12px]">{sts.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={"#FCF450"}
            refreshing={myPkgFetchResult.isLoading}
            onRefresh={() => {
              myPkgFetchResult.refetch();
            }}
          />
        }
      >
        {!myPkgFetchResult.isFetching &&
          !myPkgFetchResult.data?.value.length && (
            <Text className="text-gray-600 text-center pt-8">
              Không có gói giao đã tạo tương ứng.
            </Text>
          )}
        <View className="gap-y-2 pb-[100px] mt-2 bg-white">
          {(myPkgFetchResult.data?.value || []).map((pkg, index) => (
            <TouchableOpacity
              key={pkg.deliveryPackageId}
              className="bg-[#f9fafb] p-3 drop-shadow-sm rounded-lg border-[0.5px] border-gray-200"
              onPress={() => {
                globalMyGKGDetailsState.setModel(pkg);
                globalMyGKGDetailsState.setOnAfterCompleted(() =>
                  myPkgFetchResult.refetch()
                );
                setIsDetailBottomSheetVisible(true);
              }}
            >
              <View className="flex-row items-center justify-between gap-2">
                {/* <View className="flex-row items-center">
                <Text className="font-semibold bg-gray-100 text-gray-600 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100 text-[11px]">
                  PKG-{pkg.deliveryPackageId}
                </Text>
              </View> */}
                <View className="flex-row">
                  <Text className="font-semibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
                    {utilService.formatTime(pkg.startTime) +
                      " - " +
                      utilService.formatTime(pkg.endTime)}
                  </Text>
                  <Text className="ml-2 bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
                    {dayjs(pkg.intendedReceiveDate)
                      .local()
                      .format("DD/MM/YYYY")}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="font-semibold border-green-100 border-[1px] text-green-800 font-medium me-2 px-2.5 py-0.5 rounded-full text-[11px] rounded">
                    Hoàn thành {pkg.successful + pkg.failed}/{pkg.total}
                  </Text>
                </View>
              </View>
              <View className="mt-2 border-[1px] border-gray-100 p-1 pt-0">
                {pkg.dormitories.map((dorm) => (
                  <View key={dorm.id} className="mt-1">
                    <Text className="text-[12px]">
                      {dorm.id == 1 ? "KTX Khu A" : "KTX Khu B"} ({dorm.total}{" "}
                      đơn)
                    </Text>
                    <Text className="text-[11px] text-gray-600">
                      {dorm.waiting} chưa giao |{" "}
                      <Text className="text-[#06b6d4]">
                        {dorm.delivering} đang giao
                      </Text>{" "}
                      | {dorm.successful} đã giao | {dorm.failed} giao thất bại
                    </Text>
                    {/* <View className="border-[0.5px] border-gray-200 my-1" /> */}
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomSheet
        containerStyle={{
          zIndex: 11,
        }}
        modalProps={{}}
        isVisible={isDetailBottomSheetVisible}
      >
        {detailBottomSheetDisplay && (
          <View
            className={`p-4 bg-white rounded-t-lg min-h-[120px] bottom-0`}
            style={{ height: detailBottomHeight }}
          >
            <TouchableOpacity
              className="items-center"
              onPress={() => setIsDetailBottomSheetVisible(false)}
            >
              <Ionicons name="chevron-down-outline" size={24} color="gray" />
            </TouchableOpacity>
            <View className="flex-1 mt-2">
              <DeliveryPKGDetail
                onClose={() => {
                  setIsDetailBottomSheetVisible(false);
                  myPkgFetchResult.refetch();
                }}
                onNotFound={() => {
                  setDetailBottomSheetDisplay(false);
                  Alert.alert(
                    `Gói vừa chọn không tồn tại.`,
                    "Vui lòng thử lại!"
                  );
                  myPkgFetchResult.refetch();
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

export default MyDeliveryPackageList;
