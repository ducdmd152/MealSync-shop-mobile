import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import orderAPIService from "@/services/api-services/order-api-service";
import sessionService from "@/services/session-service";
import utilService from "@/services/util-service";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import OrderFetchModel, { OrderStatus } from "@/types/models/OrderFetchModel";
import {
  FrameStaffInfoModel,
  ShopDeliveryStaff,
  StaffInfoModel,
} from "@/types/models/StaffInfoModel";
import { FetchOnlyListResponse } from "@/types/responses/FetchResponse";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View, TouchableOpacity } from "react-native";

import { ActivityIndicator } from "react-native-paper";
import { useToast } from "react-native-toast-notifications";
import CustomButton from "../custom/CustomButton";

interface Props {
  onComplete: (shopDeliveryStaff: ShopDeliveryStaff | null) => void;
  order: OrderFetchModel | OrderDetailModel;
  isNeedForReconfimation?: boolean;
}
const OrderDeliveryAssign = ({
  onComplete,
  order,
  isNeedForReconfimation = true,
}: Props) => {
  const toast = useToast();
  const [staffInfo, setStaffInfo] = useState(
    order.shopDeliveryStaff
      ? order.shopDeliveryStaff
      : ({
          id: -1,
        } as StaffInfoModel)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnAssignSubmitting, setIsUnAssignSubmitting] = useState(false);

  const {
    data: staffInfoListData,
    isLoading: isStaffInfoListLoading,
    error: staffInfoListError,
    refetch: staffInfoListRefetch,
    isRefetching: isStaffInfoListRefetching,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.FRAME_STAFF_INFO_LIST.concat([
      "order-delivery-assign",
    ]),
    async (): Promise<FetchOnlyListResponse<FrameStaffInfoModel>> =>
      apiClient
        .get(endpoints.FRAME_STAFF_INFO_LIST, {
          headers: {
            Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            intendedReceiveDate: utilService.formatDateTimeToYyyyMmDd(
              order.intendedReceiveDate
            ),
            startTime: order.startTime,
            endTime: order.endTime,
            orderByMode: 0,
          },
        })
        .then((response) => response.data),
    []
  );

  useFocusEffect(
    React.useCallback(() => {
      staffInfoListRefetch();
      setStaffInfo(
        order.shopDeliveryStaff
          ? order.shopDeliveryStaff
          : ({
              id: -1,
            } as StaffInfoModel)
      );
    }, [])
  );
  const onAssign = () => {
    if (staffInfo.id < 0) {
      Alert.alert(
        "Vui lòng lựa chọn",
        "Bạn cần chọn người đảm nhận giao đơn hàng MS-" + order.id
      );
      return;
    }
    Alert.alert(
      "Xác nhận",
      `Đơn hàng MS-${order.id} sẽ giao bởi ${
        staffInfo.id == 0 ? "bạn" : staffInfo.fullName
      }?`,
      [
        {
          text: "Xác nhận",
          onPress: async () => {
            orderAPIService.assign(
              order.id,
              staffInfo.id,
              (shopDeliveryStaff: ShopDeliveryStaff) => {
                // toast.show(
                //   `Đơn hàng MS-${order.id} sẽ được giao bởi ${
                //     staffInfo.id == 0 ? "bạn" : staffInfo.fullName
                //   }!`,
                //   {
                //     type: "success",
                //     duration: 5000,
                //   }
                // );
                // Toast.show({
                //   type: "info",
                //   text1: "Hoàn tất",
                //   text2: `Đơn hàng MS-${order.id} sẽ được giao bởi ${
                //     staffInfo.id == 0 ? "bạn" : staffInfo.fullName
                //   }!`,
                //   // time: 15000
                // });
                // Alert.alert(
                //   "Hoàn tất",
                //   `Đơn hàng MS-${order.id} sẽ được giao bởi ${
                //     staffInfo.id == 0 ? "bạn" : staffInfo.fullName
                //   }!`
                // );
                onComplete(shopDeliveryStaff);
              },
              (warningInfo: WarningMessageValue) => {
                Alert.alert("Xác nhận", warningInfo.message, [
                  {
                    text: "Xác nhận",
                    onPress: async () => {
                      orderAPIService.assign(
                        order.id,
                        staffInfo.id,
                        (shopDeliveryStaff: ShopDeliveryStaff) => {
                          toast.show(
                            `Đơn hàng MS-${order.id} sẽ được giao bởi ${
                              staffInfo.id == 0 ? "bạn" : staffInfo.fullName
                            }!`,
                            {
                              type: "success",
                              duration: 4000,
                            }
                          );
                          // Alert.alert(
                          //   "Hoàn tất",
                          //   `Đơn hàng MS-${order.id} sẽ được giao bởi ${
                          //     staffInfo.id == 0 ? "bạn" : staffInfo.fullName
                          //   }!`
                          // );
                          onComplete(shopDeliveryStaff);
                        },
                        (warningInfo: WarningMessageValue) => {},
                        (error: any) => {
                          Alert.alert(
                            "Oops!",
                            error?.response?.data?.error?.message ||
                              "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                          );
                        },
                        true,
                        setIsSubmitting
                      );
                    },
                  },
                  {
                    text: "Hủy",
                  },
                ]);
              },
              (error: any) => {
                Alert.alert(
                  "Oops!",
                  error?.response?.data?.error?.message ||
                    "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                );
              },
              !isNeedForReconfimation,
              setIsSubmitting
            );
          },
        },
        {
          text: "Không",
          // style: "cancel",
        },
      ]
    );
  };
  const onUnAssignRequest = async (
    isConfirmWarning: boolean,
    onSuccess = () => {},
    onError = (error: any) => {}
  ) => {
    try {
      setIsUnAssignSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/order/${order.id}/un-assign`,
        {
          isConfirm: isConfirmWarning,
        }
      );
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        onSuccess();
      } else if (isWarning) {
        const warningInfo = value as WarningMessageValue;
        Alert.alert("Xác nhận", warningInfo.message, [
          {
            text: "Đồng ý",
            onPress: async () => {
              onUnAssignRequest(true, onSuccess, onError);
            },
          },
          {
            text: "Hủy",
          },
        ]);
      }
    } catch (error: any) {
      onError(error);
    } finally {
      setIsUnAssignSubmitting(false);
    }
  };
  const onUnAssign = () => {
    Alert.alert("Xác nhận", `Bỏ phân công giao hàng cho đơn MS-${order.id}?`, [
      {
        text: "Xác nhận",
        onPress: async () => {
          onUnAssignRequest(
            false,
            () => {
              onComplete(null);
              toast.show(`Đã gỡ phân công giao hàng đơn MS-${order.id} `, {
                type: "info",
                duration: 1500,
              });
            },
            (error) => {
              Alert.alert(
                "Oops!",
                error?.response?.data?.error?.message ||
                  "Yêu cầu bị từ chối, vui lòng thử lại sau!"
              );
            }
          );
        },
      },
      {
        text: "Không",
        // style: "cancel",
      },
    ]);
  };
  return (
    <View>
      <Text className="font-semibold">Giao đơn hàng MS-{order.id}</Text>
      <Text className="italic mt-2">
        Khung giờ {utilService.formatTime(order.startTime)}-
        {utilService.formatTime(order.endTime)} |{" "}
        {utilService.formatDateDdMmYyyy(order.intendedReceiveDate)}
      </Text>
      {isStaffInfoListLoading ? (
        <ActivityIndicator animating={isStaffInfoListLoading} color="#FCF450" />
      ) : staffInfoListData?.isFailure ||
        staffInfoListData?.value.length == 0 ? (
        <Text>Không tìm thấy thông tin</Text>
      ) : (
        <View>
          <TouchableOpacity
            className={`mt-2 flex-row px-[4px] py-[8px] border-2 border-gray-200 rounded-md ${
              order.shopDeliveryStaff?.id == 0 && "bg-green-100"
            }`}
            onPress={() =>
              setStaffInfo(staffInfoListData?.value[0].staffInfor || staffInfo)
            }
          >
            {staffInfo.id == 0 ? (
              <View className="mr-2">
                <Ionicons name="checkmark-circle" size={19} color="green" />
              </View>
            ) : (
              <View
                className="w-[18px] h-[18px] border-[2px] border-gray-200 mr-2"
                style={{ borderRadius: 100 }}
              />
            )}
            <Text className="font-semibold">
              Bạn{" "}
              <Text className="text-gray-700 text-[11px]">
                (
                {(staffInfoListData?.value[0].waiting || 0) +
                  (staffInfoListData?.value[0].delivering || 0)}{" "}
                đơn chưa giao/hoàn thành)
              </Text>
            </Text>
          </TouchableOpacity>
          {staffInfoListData?.value.length == 1 && (
            <Text className="italic mt-2 text-right">
              Không có nhân viên nào đang hoạt động
            </Text>
          )}

          <View className="">
            {staffInfoListData?.value
              .filter((item) => item.staffInfor.id != 0)
              .map((staff) => (
                <TouchableOpacity
                  key={staff.staffInfor.id}
                  className={`mt-2 flex-row px-[4px] py-[8px] border-2 border-gray-200 rounded-md ${
                    order.shopDeliveryStaff?.id == staff.staffInfor.id &&
                    "bg-green-100"
                  }`}
                  onPress={() => setStaffInfo(staff.staffInfor)}
                >
                  {staffInfo.id == staff.staffInfor.id ? (
                    <View className="mr-2">
                      <Ionicons
                        name="checkmark-circle"
                        size={19}
                        color="green"
                      />
                    </View>
                  ) : (
                    <View
                      className="w-[18px] h-[18px] border-2 border-gray-200 mr-2"
                      style={{ borderRadius: 100 }}
                    />
                  )}

                  <Text className="font-semibold">
                    {utilService.shortenName(staff.staffInfor.fullName)}{" "}
                    <Text className="text-gray-700 text-[11px]">
                      ({staff.waiting + staff.delivering} đơn chưa giao/hoàn
                      thành)
                    </Text>
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      )}
      <CustomButton
        title="Hoàn tất"
        handlePress={() => {
          onAssign();
        }}
        isLoading={isSubmitting}
        containerStyleClasses="mt-5 h-[36px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold z-10"
        textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
      />
      {order.shopDeliveryStaff != null &&
        order.status == OrderStatus.Preparing && (
          <CustomButton
            title="Bỏ phân công"
            handlePress={() => {
              onUnAssign();
            }}
            isLoading={isUnAssignSubmitting}
            containerStyleClasses="mt-2 h-[36px] px-4 bg-transparent border-[1px] border-secondary-100 bg-white font-medium z-10"
            textStyleClasses="text-[16px] text-gray-900 ml-1 text-secondary"
          />
        )}
      {/* <Toast position="bottom" /> */}
    </View>
  );
};

export default OrderDeliveryAssign;
