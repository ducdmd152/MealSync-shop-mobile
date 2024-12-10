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
import React, { useEffect, useState } from "react";
import { Alert, Text, View, TouchableOpacity, TextInput } from "react-native";

import { ActivityIndicator } from "react-native-paper";
import { useToast } from "react-native-toast-notifications";
import CustomButton from "../custom/CustomButton";
import dayjs from "dayjs";
import { DeliveryPackageGroupDetailsModel } from "@/types/models/DeliveryPackageModel";
import CONSTANTS from "@/constants/data";

interface Props {
  onSuccess: (suggesstion: DeliveryPackageGroupDetailsModel) => void;
  onError: (error: any) => void;
  isNeedForReconfimation?: boolean;
  startTime: number;
  intendedReceiveDate: string;
  endTime: number;
  beforeGetSuggestion: () => void;
  isCreateMode?: boolean;
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
  isCreateMode = true,
}: Props) => {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [maxWeightOfPackage, setMaxWeightOfPackage] = useState(5);
  const [maxWeightOfPackageText, setMaxWeightOfPackageText] = useState(
    maxWeightOfPackage.toString()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personIds, setPersonIds] = useState<number[]>([]);

  const personsFetcher = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.FRAME_STAFF_INFO_LIST.concat(["gpkg-page"]),
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

  const lastMaxWeightCarryFetcher = useFetchWithRQWithFetchFunc(
    ["shop-owner/max-carry-weight"],
    async (): Promise<
      FetchValueResponse<{
        staffMaxCarryWeight: number;
      }>
    > =>
      apiClient
        .get("shop-owner/max-carry-weight")
        .then((response) => response.data),
    []
  );
  useEffect(() => {
    if (lastMaxWeightCarryFetcher.data?.value.staffMaxCarryWeight)
      setMaxWeightOfPackage(
        lastMaxWeightCarryFetcher.data?.value.staffMaxCarryWeight
      );
    console.log(
      "lastMaxWeightCarryFetcher.data?.value.staffMaxCarryWeight: ",
      lastMaxWeightCarryFetcher.data?.value.staffMaxCarryWeight
    );
  }, [lastMaxWeightCarryFetcher.data?.value.staffMaxCarryWeight]);
  useEffect(() => {
    setMaxWeightOfPackageText(maxWeightOfPackage.toString());
  }, [maxWeightOfPackage]);
  useFocusEffect(
    React.useCallback(() => {
      personsFetcher.refetch();
      lastMaxWeightCarryFetcher.refetch();
    }, [])
  );

  const onAutoAssign = async () => {
    if (personIds.length === 0) {
      Alert.alert(
        "Vui lòng lựa chọn",
        "Bạn cần chọn ít nhất một người đảm nhận giao đơn"
      );
      return;
    }
    beforeGetSuggestion();
    setIsSubmitting(true);
    try {
      const response = await apiClient.get<
        FetchValueResponse<DeliveryPackageGroupDetailsModel>
      >(
        `shop-owner/delivery-package/suggest-${
          isCreateMode ? "create" : "update"
        }?${personIds.map((id) => `shipperIds=${id}`).join("&")}`,
        {
          params: {
            startTime,
            endTime,
            intendedReceiveDate,
            staffMaxCarryWeight: parseFloat(maxWeightOfPackageText),
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
  if (step == 1)
    return (
      <View>
        {/* <Text className="font-semibold">Phân chia giao hàng</Text> */}
        <View className="gap-y-2 mt-1">
          <View>
            <Text className="font-semibold">
              Nhập khối lượng (kg) tối đa của mỗi gói giao
            </Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 mt-1 rounded p-2 text-[28px] h-16 bg-white text-center"
                placeholder="0"
                keyboardType="numeric"
                value={maxWeightOfPackageText}
                onChangeText={(text) => {
                  setMaxWeightOfPackageText(text);
                }}
                placeholderTextColor="#888"
              />
              <Text className="absolute right-4 top-6 text-gray-500 text-[20px] italic">
                Kg
              </Text>
            </View>
          </View>

          <CustomButton
            title="Đề xuất phân công"
            handlePress={() => {
              // Kiểm tra nếu giá trị nhập là một số hợp lệ (float)
              const parsedValue = parseFloat(maxWeightOfPackageText);

              if (
                !CONSTANTS.REGEX.number.test(maxWeightOfPackageText) ||
                isNaN(parsedValue) ||
                parsedValue <= 0
              ) {
                // Hiển thị cảnh báo nếu giá trị không hợp lệ (không phải số hoặc số <= 0)
                Alert.alert("Oops", "Vui lòng nhập một số dương hợp lệ!");
                return;
              } else {
                // Nếu hợp lệ, cập nhật lại giá trị thành số
                setMaxWeightOfPackage(parsedValue);
                onAutoAssign();
              }
            }}
            isLoading={isSubmitting}
            containerStyleClasses="mt-5 h-[36px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold z-10"
            textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
          />
          <CustomButton
            title="Quay lại"
            isDisabled={isSubmitting}
            handlePress={() => setStep(0)}
            containerStyleClasses="mt-2 w-full h-[36px] px-4 bg-transparent border-2 bg-white border-secondary-100 z-10"
            // iconLeft={
            //   <Ionicons name="add-circle-outline" size={21} color="white" />
            // }
            textStyleClasses="text-[14px] text-gray-900 ml-1 text-white text-secondary-100"
          />
        </View>
      </View>
    );
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
                <View
                  className="w-[18px] h-[18px] border-2 border-gray-200 mr-2"
                  style={{ borderRadius: 100 }}
                />
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
                    <View className="w-[18px] h-[18px] border-2 border-gray-200 mr-2 rounded-sm" />
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
        title="Tiếp tục"
        handlePress={() => {
          setStep(1);
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
