import { View, Text, TouchableOpacity, Dimensions, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomButton from "../custom/CustomButton";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import utilService from "@/services/util-service";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { FetchOnlyListResponse } from "@/types/responses/FetchResponse";
import { DeliveryPackageGroupModel } from "@/types/models/DeliveryPackageModel";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import sessionService from "@/services/session-service";
import useTimeRangeState from "@/hooks/states/useTimeRangeState";
import { ActivityIndicator } from "react-native-paper";
import { FrameDateTime } from "@/types/models/TimeModel";
import { BottomSheet } from "@rneui/themed";
import DeliveryFrameDetail from "./DeliveryFrameDetail";
import dayjs from "dayjs";

const detailBottomHeight = Dimensions.get("window").height - 100;

const DeliveryFrameList = ({ beforeGo }: { beforeGo: () => void }) => {
  const isFocused = useRef(false);
  const globalTimeRangeFilter = useTimeRangeState();
  const [isDetailBottomSheetVisible, setIsDetailBottomSheetVisible] =
    useState(false);
  const [detailBottomSheetDisplay, setDetailBottomSheetDisplay] =
    useState(true);
  const [detailQuery, setDetailQuery] = useState<FrameDateTime>(
    {} as FrameDateTime
  );
  const gpkgFetchResult = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.DELIVERY_PACKAGE_GROUP_LIST.concat([
      "delivery-frame-list",
    ]),
    async (): Promise<FetchOnlyListResponse<DeliveryPackageGroupModel>> =>
      apiClient
        .get(endpoints.DELIVERY_PACKAGE_GROUP_LIST, {
          headers: {
            Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            startTime: globalTimeRangeFilter.startTime,
            endTime: globalTimeRangeFilter.endTime,
            intendedReceiveDate: dayjs(globalTimeRangeFilter.date).format(
              "YYYY/MM/DD"
            ),
          },
        })
        .then((response) => response.data),
    []
  );
  useFocusEffect(
    useCallback(() => {
      gpkgFetchResult.refetch();
      isFocused.current = true;
      return () => {
        isFocused.current = false;
      };
    }, [])
  );
  useEffect(() => {
    if (isFocused.current) {
      gpkgFetchResult.refetch();
    }
  }, [globalTimeRangeFilter]);
  // console.log("gpkgFetchResult.data?.value", gpkgFetchResult.data?.value);
  return (
    <View className="w-full flex-1 bg-white text-black relative">
      <View className="absolute w-full items-end justify-center bottom-12 right-2 z-10">
        <CustomButton
          title="Tạo mới"
          handlePress={() => {
            beforeGo();
            router.push("/delivery-package-group/create");
          }}
          containerStyleClasses="mb-1 mr-2 h-[36px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10"
          iconLeft={
            <Ionicons name="add-circle-outline" size={21} color="white" />
          }
          textStyleClasses="text-[15px] text-gray-900 ml-1 text-white"
        />
      </View>

      <View className="w-full gap-2 p-4 pt-1">
        <View className="w-full">
          {/* <Searchbar
            style={{
              height: 40,
              // backgroundColor: "white",
              // borderColor: "lightgray",
              // borderWidth: 2,
            }}
            inputStyle={{ minHeight: 0 }}
            placeholder="Nhập tên món..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          /> */}
        </View>
        {gpkgFetchResult.data?.value.length && (
          <Text className="text-gray-600 text-center mt-[-12px]">
            {gpkgFetchResult.data?.value.length} khung phân công đã tạo
          </Text>
        )}

        <ScrollView
          className="gap-y-2 pb-[250px]"
          refreshControl={
            <RefreshControl
              tintColor={"#FCF450"}
              refreshing={gpkgFetchResult.isRefetching}
              onRefresh={() => {
                gpkgFetchResult.refetch();
              }}
            />
          }
        >
          {gpkgFetchResult.isLoading && (
            <ActivityIndicator animating={true} color="#FCF450" />
          )}
          {!gpkgFetchResult.isFetching &&
            !gpkgFetchResult.data?.value.length && (
              <Text className="text-gray-600 text-center pt-8">
                Không có phân công đã tạo tương ứng.
              </Text>
            )}
          {!gpkgFetchResult.isFetching &&
            Array.isArray(gpkgFetchResult.data?.value) &&
            gpkgFetchResult.data?.value.map((gPKG, index) => (
              <TouchableOpacity
                onPress={() => {
                  setDetailQuery({
                    startTime: gPKG.startTime,
                    endTime: gPKG.endTime,
                    intendedReceiveDate: utilService.formatDateTimeToYyyyMmDd(
                      gPKG.intendedReceiveDate
                    ),
                  });
                  setIsDetailBottomSheetVisible(true);
                }}
                key={(Math.random() % 100_000_000) + index}
                className="p-3 drop-shadow-md rounded-lg shadow border-[0.5px] border-gray-200"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-row">
                    <Text className="font-psemibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
                      {utilService.formatTime(gPKG.startTime) +
                        " - " +
                        utilService.formatTime(gPKG.endTime)}
                    </Text>
                    <Text className="ml-2 bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
                      {utilService.formatDateDdMmYyyy(gPKG.intendedReceiveDate)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {/* <Text className="text-[12px] font-psemibold bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100">
                      GPKG-{123 + index}
                    </Text> */}
                  </View>
                </View>

                <View className="gap-y-2 mt-1 ml-1">
                  {gPKG.deliveryPackageGroups.map((pkg) => (
                    <Text
                      key={pkg.deliveryPackageId}
                      className="text-[11.5px] text-gray-700 font-semibold"
                    >
                      {utilService.shortenName(pkg.shopDeliveryStaff.fullName)}{" "}
                      {pkg.shopDeliveryStaff.id == 0 && (
                        <Text className="italic">{"(bạn) "}</Text>
                      )}
                      - {pkg.total} đơn (
                      {pkg.dormitories
                        .map(
                          (dorm) => `${dorm.total}${dorm.id == 1 ? "A" : "B"}`
                        )
                        .join(", ")}
                      ) - Hoàn tất {pkg.successful + pkg.failed}/{pkg.total}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
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
              <DeliveryFrameDetail
                onClose={() => setIsDetailBottomSheetVisible(false)}
                query={detailQuery}
                onNotFound={() => {
                  setDetailBottomSheetDisplay(false);
                  Alert.alert(
                    `Khung phân công vừa chọn không tồn tại.`,
                    "Vui lòng thử lại!"
                  );
                  gpkgFetchResult.refetch();
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

export default DeliveryFrameList;
