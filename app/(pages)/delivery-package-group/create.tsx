import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
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
import { router, useFocusEffect } from "expo-router";
import utilService from "@/services/util-service";
import GPKGDateTimeFrameSelect from "@/components/common/GPKGDateTimeFrameSelect";
import OrderFetchModel, {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { UseQueryResult } from "@tanstack/react-query";

import { FrameStaffInfoModel } from "@/types/models/StaffInfoModel";
import sessionService from "@/services/session-service";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "react-native-toast-notifications";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import CompleteDeliveryConfirmModal from "@/components/target-modals/CompleteDeliveryConfirmModal";
import useGlobalCompleteDeliveryConfirm from "@/hooks/states/useGlobalCompleteDeliveryConfirm";
import CustomModal from "@/components/common/CustomModal";
import OrderDeliveryAutoAssign from "@/components/delivery-package/OrderDeliveryAutoSuggestAssign";
import { DeliveryPackageGroupDetailsModel } from "@/types/models/DeliveryPackageModel";
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
  intendedReceiveDate: string;
}
const DeliveryPackageGroupCreate = () => {
  const globalCompleteDeliveryConfirm = useGlobalCompleteDeliveryConfirm();

  const toast = useToast();
  const [query, setQuery] = useState<GPKGQuery>({
    startTime: 0,
    endTime: 30,
    intendedReceiveDate: new Date()
      .toLocaleDateString("sv-SE")
      .replace(/-/g, "/"),
  } as GPKGQuery);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpenSuggestAssign, setIsOpenSuggestAssign] = useState(false);

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
    REACT_QUERY_CACHE_KEYS.FRAME_STAFF_INFO_LIST.concat(["gpkg-page"]),
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
  const onRefresh = () => {
    orderFetchResult?.refetch();
    deliveryPersonFetchResult.refetch();
  };

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
  function assign(personId: number, orderId: number): void {
    setGPKGCreateRequest((prevRequest) => {
      const deliveryPackages = [...prevRequest.deliveryPackages];
      const deliveryPackage = deliveryPackages.find(
        (pkg) => pkg.shopDeliveryStaffId === personId
      );

      if (deliveryPackage) {
        if (!deliveryPackage.orderIds.includes(orderId)) {
          deliveryPackage.orderIds = [...deliveryPackage.orderIds, orderId];
        }
      } else {
        deliveryPackages.push({
          shopDeliveryStaffId: personId,
          orderIds: [orderId],
        });
      }

      return {
        ...prevRequest,
        deliveryPackages,
      };
    });
  }

  function remove(personId: number, orderId: number): void {
    setGPKGCreateRequest((prevRequest) => {
      const deliveryPackages = prevRequest.deliveryPackages
        .map((pkg) => {
          if (pkg.shopDeliveryStaffId === personId) {
            return {
              ...pkg,
              orderIds: pkg.orderIds.filter((id) => id !== orderId),
            };
          }
          return pkg;
        })
        .filter((pkg) => pkg.orderIds.length > 0);

      return {
        ...prevRequest,
        deliveryPackages,
      };
    });
  }

  const getCurrentPerson = () => {
    return deliveryPersonFetchResult.data?.value.find(
      (person) => person.staffInfor.id == currentDeliveryPersonId
    );
  };

  const onRequest = async (requestData: GPKGCreateRequest) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.post(
        `shop-owner/delivery-package`,
        requestData
      );
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        Alert.alert(
          "Hoàn tất",
          `Tạo phân công thành công cho khung giờ ${
            utilService.formatTime(query.startTime) +
            " - " +
            utilService.formatTime(query.endTime)
          } ngày ${utilService.formatDateDdMmYyyy(query.intendedReceiveDate)}`
        );
        router.back();
      } else if (isWarning) {
        if (requestData.isConfirm) return;
        const warningInfo = value as WarningMessageValue;
        Alert.alert("Xác nhận", warningInfo.message, [
          {
            text: "Đồng ý",
            onPress: async () => {
              onRequest({ ...requestData, isConfirm: true });
            },
          },
          {
            text: "Hủy",
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const onSubmit = async () => {
    if (gpkgCreateRequest.deliveryPackages.length == 0) {
      Alert.alert(
        "Oops!",
        "Bạn cần phân công ít nhất một đơn hàng để hoàn tất!"
      );
      return;
    }
    onRequest({
      isConfirm: false,
      deliveryPackages: gpkgCreateRequest.deliveryPackages.map((pkg) => ({
        ...pkg,
        shopDeliveryStaffId:
          pkg.shopDeliveryStaffId === 0 ? undefined : pkg.shopDeliveryStaffId,
      })),
    });
  };

  const deliveryPersonSelectArea = (
    <View>
      {deliveryPersonFetchResult.data?.value && (
        <Text className="italic text-gray-600 text-[10px]">
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
                key={person.staffInfor.id}
                className={`flex-row items-center gap-x-1 bg-gray-100 rounded-xl px-2 py-2 pr-3 ${
                  currentDeliveryPersonId == person.staffInfor.id
                    ? "bg-secondary"
                    : ""
                }`}
                onPress={() => setCurrentDeliveryPersonId(person.staffInfor.id)}
              >
                <Image
                  source={{ uri: person.staffInfor.avatarUrl }}
                  resizeMode="cover"
                  className="h-[18px] w-[18px] rounded-full opacity-85"
                />
                <Text>
                  {utilService.shortenName(person.staffInfor.fullName)}
                  {person.staffInfor.id == 0 && " (bạn)"}{" "}
                  {`(${getAssignedOrdersOf(person.staffInfor.id).length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
  const currentPersonArea = (
    <View className="border-2 border-gray-300 p-2 flex-1">
      <ScrollView>
        <View className="gap-y-[4px]">
          {getAssignedOrdersOf(currentDeliveryPersonId).map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => {
                globalCompleteDeliveryConfirm.setIsShowActionale(false);
                globalCompleteDeliveryConfirm.setStep(0);
                globalCompleteDeliveryConfirm.setId(order.id);
                globalCompleteDeliveryConfirm.setOnAfterCompleted(() =>
                  onRefresh()
                );
                globalCompleteDeliveryConfirm.setIsModalVisible(true);
                globalCompleteDeliveryConfirm.setModel(order);
              }}
              className="p-[4px] px-[6px] bg-white border-2 border-gray-300 rounded-lg"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="text-[10px] font-semibold bg-gray-100 text-gray-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100">
                    MS-{order.id}
                  </Text>
                </View>
                <View className="flex-row gap-x-1 items-center">
                  <Text className="ml-2  font-semibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[10px] rounded">
                    {order.dormitoryId == 1 ? "Đến KTX khu A" : "Đến KTX khu B"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      remove(currentDeliveryPersonId, order.id);
                      // toast.show(
                      //   `Đơn hàng MS-${order.id} chuyển về chưa phân công giao hàng.`,
                      //   {
                      //     type: "info",
                      //     duration: 1500,
                      //   }
                      // );
                    }}
                    className={` flex-row items-center rounded-md items-center justify-center px-[6px] py-[2.2px] bg-gray-400`}
                    disabled={order.status != OrderStatus.Preparing}
                  >
                    <Text className="text-[12px] text-white mr-1">
                      Bỏ phân công
                    </Text>
                    <Ionicons
                      name="chevron-down-outline"
                      size={14}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row justify-between items-center mt-[4px]">
                <View className="flex-1 flex-row justify-start items-center gap-2">
                  <Image
                    source={{
                      uri: order.orderDetails[0].imageUrl,
                    }}
                    resizeMode="cover"
                    className="h-[12px] w-[12px] rounded-md opacity-85"
                  />
                  <View className="">
                    <Text className="text-xs italic text-gray-500">
                      {order.orderDetailSummaryShort}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-x-1 items-center">
                  <Text
                    className={`text-[10px] font-medium me-2 px-2.5 py-1 rounded `}
                  >
                    {getOrderStatusDescription(order.status)?.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
  const unAssignOrdersArea = (
    <View className="border-2 border-gray-300 mt-2 p-2 mb-[-14px] flex-1">
      <Text className="italic text-gray-700 text-center mb-1 text-[10px]">
        Danh sách đơn hàng đang trống ({getUnassignedOrders().length} đơn hàng)
      </Text>
      <ScrollView style={{ flexGrow: 1 }}>
        <View className="gap-y-[4px] flex-1">
          {getUnassignedOrders().map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => {
                globalCompleteDeliveryConfirm.setIsShowActionale(false);
                globalCompleteDeliveryConfirm.setStep(0);
                globalCompleteDeliveryConfirm.setId(order.id);
                globalCompleteDeliveryConfirm.setOnAfterCompleted(() =>
                  onRefresh()
                );
                globalCompleteDeliveryConfirm.setIsModalVisible(true);
                globalCompleteDeliveryConfirm.setModel(order);
              }}
              className="p-[4px] px-[6px] bg-white border-2 border-gray-300 rounded-lg"
            >
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-center">
                  <Text className="text-[10px] font-semibold bg-gray-100 text-gray-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100">
                    MS-{order.id}
                  </Text>
                </View>
                <View className="flex-row gap-x-1 items-center">
                  <Text className="ml-2  font-semibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[10px] rounded">
                    {order.dormitoryId == 1 ? "Đến KTX khu A" : "Đến KTX khu B"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      assign(currentDeliveryPersonId, order.id);
                      // toast.show(
                      //   `Đơn MS-${
                      //     order.id
                      //   } được phân công giao hàng cho ${utilService.shortenName(
                      //     getCurrentPerson()?.staffInfor.fullName || ""
                      //   )}${
                      //     getCurrentPerson()?.staffInfor.id == 0 && " (bạn)"
                      //   }.`,
                      //   {
                      //     type: "info",
                      //     duration: 1500,
                      //   }
                      // );
                    }}
                    className={` flex-row items-center rounded-md items-center justify-center px-[6px] py-[2.2px] bg-[#227B94]`}
                    disabled={order.status != OrderStatus.Preparing}
                  >
                    <Text className="text-[12px] text-white mr-1">
                      Phân công
                    </Text>
                    <Ionicons
                      name="chevron-up-outline"
                      size={14}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row justify-between items-center mt-[4px]">
                <View className="flex-1 flex-row justify-start items-center gap-2">
                  <Image
                    source={{
                      uri: order.orderDetails[0].imageUrl,
                    }}
                    resizeMode="cover"
                    className="h-[12px] w-[12px] rounded-md opacity-85"
                  />
                  <View className="">
                    <Text className="text-xs italic text-gray-500">
                      {order.orderDetailSummaryShort}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-x-1 items-center">
                  <Text
                    className={`text-[10px] font-medium me-2 px-2.5 py-1 rounded `}
                  >
                    {getOrderStatusDescription(order.status)?.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
  return (
    <PageLayoutWrapper isScroll={false}>
      <GPKGDateTimeFrameSelect
        onSuggest={() => setIsOpenSuggestAssign(true)}
        query={query}
        setQuery={setQuery}
        isAnyUnCreatedFrame={isAnyUnCreatedFrame}
        setIsAnyUnCreatedFrame={setIsAnyUnCreatedFrame}
        setOrderFetchResult={setOrderFetchResult}
      />
      {isAnyUnCreatedFrame && (
        <View className="px-4 pb-2 mt-[-8px] flex-1">
          {deliveryPersonSelectArea}
          {currentPersonArea}
          {unAssignOrdersArea}
          <CustomButton
            title="Hoàn tất"
            isLoading={isSubmitting}
            handlePress={() => {
              onSubmit();
            }}
            containerStyleClasses="mt-5 h-[40px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold z-10"
            textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
          />
        </View>
      )}

      <CompleteDeliveryConfirmModal
        onParentOpen={() => {}}
        onParentClose={() => {}}
      />
      <CustomModal
        title={``}
        hasHeader={false}
        isOpen={isOpenSuggestAssign}
        setIsOpen={(value) => setIsOpenSuggestAssign(value)}
        titleStyleClasses="text-center flex-1"
        containerStyleClasses="w-[98%]"
        onBackdropPress={() => {
          setIsOpenSuggestAssign(false);
        }}
      >
        <OrderDeliveryAutoAssign
          beforeGetSuggestion={() => {
            orderFetchResult?.refetch();
          }}
          onSuccess={(suggesstion) => {
            toast.show(`Đã thực hiện đề xuất phân công.`, {
              type: "info",
              duration: 1500,
            });
            setGPKGCreateRequest({
              isConfirm: false,
              deliveryPackages:
                suggesstion.deliveryPackageGroups?.map((group) => {
                  return {
                    shopDeliveryStaffId: group.shopDeliveryStaff?.id,
                    orderIds: group.orders.map((order) => order.id),
                  };
                }) || [],
            });
            deliveryPersonFetchResult.refetch();
            setIsOpenSuggestAssign(false);
          }}
          onError={(error) => {
            Alert.alert(
              "Oops!",
              error?.response?.data?.error?.message ||
                "Yêu cầu bị từ chối, vui lòng thử lại sau!"
            );
          }}
          {...query}
        />
      </CustomModal>
    </PageLayoutWrapper>
  );
};

export default DeliveryPackageGroupCreate;
