import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import ScrollPicker, {
  ScrollPickerHandle,
} from "react-native-wheel-scrollview-picker";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import FetchResponse, {
  FetchOnlyListResponse,
} from "@/types/responses/FetchResponse";
import { OperatingSlotModel } from "@/types/models/OperatingSlotModel";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { useFocusEffect } from "expo-router";
import utilService from "@/services/util-service";
import GPKGDateTimeFrameSelect from "@/components/common/GPKGDateTimeFrameSelect";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import { UseQueryResult } from "@tanstack/react-query";
import { ScrollView } from "react-native-gesture-handler";
import { FrameStaffInfoModel } from "@/types/models/StaffInfoModel";
import sessionService from "@/services/session-service";
interface GPKGCreateRequest {
  isConfirm: boolean;
  deliveryPackages: {
    shopDeliveryStaffId: number | undefined;
    orderIds: number[];
  }[];
}
export interface GPKGQuery {
  startTime: number;
  endTime: number;
  intendedRecieveDate: string;
}
const DeliveryPackageGroupCreate = () => {
  const [query, setQuery] = useState<GPKGQuery>({
    startTime: 0,
    endTime: 30,
    intendedRecieveDate: new Date()
      .toLocaleDateString("sv-SE")
      .replace(/-/g, "/"),
  } as GPKGQuery);
  const [orderFetchResult, setOrderFetchResult] =
    useState<UseQueryResult<FetchResponse<OrderFetchModel>, Error>>();
  const [gpkgCreateRequest, setGPKGCreateRequest] = useState<GPKGCreateRequest>(
    {
      isConfirm: false,
      deliveryPackages: [],
    }
  );
  const [currentDeliveryPersonId, setCurrentDeliveryPersonId] = useState(0);
  const [isAnyUnCreatedFrame, setIsAnyUnCreatedFrame] = useState(true);

  const deliveryPersonFetchResult = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.FRAME_STAFF_INFO_LIST.concat(["gpkg-create-page"]),
    async (): Promise<FetchOnlyListResponse<FrameStaffInfoModel>> =>
      apiClient
        .get(endpoints.FRAME_STAFF_INFO_LIST, {
          headers: {
            Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            ...query,
            orderByMode: 0,
          },
        })
        .then((response) => response.data),
    [query]
  );
  console.log(
    "deliveryPersonFetchResult: ",
    deliveryPersonFetchResult.data?.value
  );
  function getUnassignedOrders(): OrderFetchModel[] {
    const allOrders = orderFetchResult?.data?.value.items || [];
    const requestData = gpkgCreateRequest;
    const assignedOrderIds = new Set(
      requestData.deliveryPackages.flatMap((pkg) => pkg.orderIds)
    );

    return allOrders.filter((order) => !assignedOrderIds.has(order.id));
  }

  function getAssignedOrdersOf(shopDeliveryStaffId: number): OrderFetchModel[] {
    const allOrders = orderFetchResult?.data?.value.items || [];
    const requestData = gpkgCreateRequest;
    const assignedOrderIds = new Set(
      requestData.deliveryPackages
        .filter((pkg) => pkg.shopDeliveryStaffId === shopDeliveryStaffId)
        .flatMap((pkg) => pkg.orderIds)
    );

    return allOrders.filter((order) => assignedOrderIds.has(order.id));
  }

  const deliveryPersonSelectArea = (
    <View>
      {deliveryPersonFetchResult.data?.value && (
        <Text>
          Bạn và{" "}
          {deliveryPersonFetchResult.data?.value.length == 0
            ? 0
            : deliveryPersonFetchResult.data?.value.length - 1}{" "}
          nhân viên khác đang hoạt động
        </Text>
      )}
      <View className="mt-2">
        <ScrollView style={{ width: "100%", flexShrink: 0 }} horizontal={true}>
          <View className="w-full flex-row gap-2 items-center justify-between pb-2">
            {deliveryPersonFetchResult.data?.value.map((person, index) => (
              <TouchableOpacity
                className={`flex-row items-center gap-x-1 bg-gray-100 rounded-xl px-2 py-2 ${
                  currentDeliveryPersonId == person.staffInfor.id
                    ? "bg-secondary"
                    : ""
                }`}
                key={index}
                onPress={() => setCurrentDeliveryPersonId(person.staffInfor.id)}
              >
                <Image
                  source={{ uri: person.staffInfor.avatarUrl }}
                  resizeMode="cover"
                  className="h-[18px] w-[18px] rounded-md opacity-85"
                />
                <Text>
                  {utilService.shortenName(person.staffInfor.fullName)}
                  {person.staffInfor.id == 0 && " (bạn)"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
  return (
    <PageLayoutWrapper isScroll={false}>
      <GPKGDateTimeFrameSelect
        query={query}
        setQuery={setQuery}
        isAnyUnCreatedFrame={isAnyUnCreatedFrame}
        setIsAnyUnCreatedFrame={setIsAnyUnCreatedFrame}
        setOrderFetchResult={setOrderFetchResult}
      />
      {isAnyUnCreatedFrame && (
        <View className="px-4 py-2 flex-1">{deliveryPersonSelectArea}</View>
      )}
    </PageLayoutWrapper>
  );
};

export default DeliveryPackageGroupCreate;
