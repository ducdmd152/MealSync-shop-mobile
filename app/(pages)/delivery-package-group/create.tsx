import { View, Text } from "react-native";
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
interface GPKGCreateRequest {
  isConfirm: boolean;
  deliveryPackages: {
    shopDeliveryStaffId: number | undefined;
    orderIds: number[];
  }[];
}
const DeliveryPackageGroupCreate = () => {
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
  return (
    <PageLayoutWrapper isScroll={false}>
      <GPKGDateTimeFrameSelect
        isAnyUnCreatedFrame={isAnyUnCreatedFrame}
        setIsAnyUnCreatedFrame={setIsAnyUnCreatedFrame}
        setOrderFetchResult={setOrderFetchResult}
      />
    </PageLayoutWrapper>
  );
};

export default DeliveryPackageGroupCreate;
