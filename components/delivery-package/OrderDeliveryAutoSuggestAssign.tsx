import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import orderAPIService from "@/services/api-services/order-api-service";
import sessionService from "@/services/session-service";
import utilService from "@/services/util-service";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import {
  FrameStaffInfoModel,
  ShopDeliveryStaff,
  StaffInfoModel,
} from "@/types/models/StaffInfoModel";
import {
  FetchOnlyListResponse,
  FetchValueResponse,
} from "@/types/responses/FetchResponse";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View, TouchableOpacity } from "react-native";

import { ActivityIndicator } from "react-native-paper";
import { useToast } from "react-native-toast-notifications";
import CustomButton from "../custom/CustomButton";
import dayjs from "dayjs";
import { DeliveryPackageGroupDetailsModel } from "@/types/models/DeliveryPackageModel";

interface Props {
  onSuccess: (suggesstion: DeliveryPackageGroupDetailsModel) => void;
  onError: (error: any) => void;
  isNeedForReconfimation?: boolean;
  startTime: number;
  intendedReceiveDate: string;
  endTime: number;
  beforeGetSuggestion: () => void;
  // staffIds: number[];
  // setStaffIds: (ids: number[]) => void;
}
const OrderDeliveryAutoSuggestAssign = ({
  onSuccess,
  onError,
  // staffIds,
  // setStaffIds,
  beforeGetSuggestion,
  startTime,
  endTime,
  intendedReceiveDate,
}: Props) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personIds, setPersonIds] = useState<number[]>([]);

  const personsFetcher = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.FRAME_STAFF_INFO_LIST.concat(["gpkg-update-page"]),
    async (): Promise<FetchOnlyListResponse<FrameStaffInfoModel>> =>
      apiClient
        .get(endpoints.FRAME_STAFF_INFO_LIST, {
          headers: {
            Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            intendedReceiveDate,
            startTime,
            endTime,
            orderByMode: 0,
          },
        })
        .then((response) => response.data),
    []
  );

  useFocusEffect(
    React.useCallback(() => {
      personsFetcher.refetch();
    }, [])
  );

  const onAutoAssign = async () => {
    if (personIds.length === 0) {
      Alert.alert("Vui lòng lựa chọn", "Bạn cần chọn người đảm nhận giao đơn");
      return;
    }
    beforeGetSuggestion();
    setIsSubmitting(true);
    try {
      const response = await apiClient.get<
        FetchValueResponse<DeliveryPackageGroupDetailsModel>
      >(
        `shop-owner/delivery-package/suggest-create?${personIds
          .map((id) => `shipperIds=${id}`)
          .join("&")}`,
        {
          params: {
            startTime,
            endTime,
            intendedReceiveDate,
          },
        }
      );
      onSuccess(response.data.value);
    } catch (error: any) {
      onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <View>
      <Text className="font-semibold">Phân chia giao hàng</Text>
      <Text className="italic mt-2">
        Khung giờ {utilService.formatTime(startTime)}-
        {utilService.formatTime(endTime)} |{" "}
        {utilService.formatDateDdMmYyyy(intendedReceiveDate)}
      </Text>
      {!personsFetcher.data ? (
        <ActivityIndicator animating={true} color="#FCF450" />
      ) : personsFetcher.isError || personsFetcher.data?.value.length == 0 ? (
        <Text>Không tìm thấy thông tin</Text>
      ) : (
        <View>
          <View className="">
            <TouchableOpacity
              className={`mt-2 flex-row items-center px-[4px] py-[8px] border-2 border-gray-200 rounded-md`}
              onPress={() => {
                if (
                  personIds.length <
                  (personsFetcher.data?.value || []).map(
                    (item) => item.staffInfor.id
                  ).length
                )
                  setPersonIds(
                    (personsFetcher.data?.value || []).map(
                      (item) => item.staffInfor.id
                    )
                  );
                else setPersonIds([]);
              }}
            >
              {personIds.length ==
              (personsFetcher.data?.value || []).map(
                (item) => item.staffInfor.id
              ).length ? (
                <View className="mr-2">
                  <Ionicons name="checkmark-circle" size={19} color="green" />
                </View>
              ) : (
                <View className="w-[18px] h-[18px] border-2 border-gray-200 mr-2 rounded-full" />
              )}

              <Text className="italic">Chọn tất cả</Text>
            </TouchableOpacity>
            {personsFetcher.data?.value
              // .filter((item) => item.staffInfor.id != 0)
              .map((person) => (
                <TouchableOpacity
                  key={person.staffInfor.id}
                  className={`mt-2 flex-row items-center px-[4px] py-[8px] border-2 border-gray-200 rounded-md`}
                  onPress={() => {
                    if (!personIds.includes(person.staffInfor.id))
                      setPersonIds([...personIds, person.staffInfor.id]);
                    else
                      setPersonIds(
                        personIds.filter((id) => id != person.staffInfor.id)
                      );
                  }}
                >
                  {personIds.includes(person.staffInfor.id) ? (
                    <View className="mr-2 bg-green-600 rounded-sm">
                      <Ionicons
                        name="checkmark-outline"
                        size={19}
                        color="white"
                      />
                    </View>
                  ) : (
                    <View className="w-[18px] h-[18px] border-2 border-gray-200 mr-2" />
                  )}

                  <Text className="font-semibold">
                    {person.staffInfor.id == 0
                      ? "Bạn"
                      : utilService.shortenName(
                          person.staffInfor.fullName
                        )}{" "}
                    <Text className="text-gray-700 text-[11px]">
                      ({person.waiting + person.delivering} đơn chưa giao/hoàn
                      thành)
                    </Text>
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      )}
      <CustomButton
        title="Đề xuất phân công"
        handlePress={() => {
          onAutoAssign();
        }}
        isLoading={isSubmitting}
        containerStyleClasses="mt-5 h-[36px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold z-10"
        textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
      />
      {/* <Toast position="bottom" /> */}
    </View>
  );
};

export default OrderDeliveryAutoSuggestAssign;
