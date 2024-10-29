import { View, Text, Touchable, Alert } from "react-native";
import React, { useState } from "react";
import CustomButton from "../custom/CustomButton";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import {
  FrameStaffInfoModel,
  ShopDeliveryStaff,
  StaffInfoModel,
} from "@/types/models/StaffInfoModel";
import { FetchOnlyListResponse } from "@/types/responses/FetchResponse";
import sessionService from "@/services/session-service";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import utilService from "@/services/util-service";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import { ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import orderAPIService from "@/services/api-services/order-api-service";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import { useToast } from "react-native-toast-notifications";

interface Props {
  defaultStaffId?: number;
  onComplete: (shopDeliveryStaff: ShopDeliveryStaff) => void;
  order: OrderFetchModel | OrderDetailModel;
}
const OrderDeliveryAssign = ({
  onComplete,
  order,
  defaultStaffId = -1,
}: Props) => {
  const toast = useToast();
  const [staffInfo, setStaffInfo] = useState({
    id: defaultStaffId,
  } as StaffInfoModel);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // console.log(staffInfoListData);
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
                toast.show(
                  `Đơn hàng MS-${order.id} sẽ được giao bởi ${
                    staffInfo.id == 0 ? "bạn" : staffInfo.fullName
                  }!`,
                  {
                    type: "success",
                    duration: 5000,
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
                              "Hệ thống gặp lỗi, vui lòng thử lại sau!"
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
                    "Hệ thống gặp lỗi, vui lòng thử lại sau!"
                );
              },
              false,
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
  return (
    <View>
      <Text className="font-semibold">Giao đơn hàng MS-25</Text>
      <Text className="italic mt-2">Khung giờ 6:30-7:00 | 26/10/2024</Text>
      {isStaffInfoListLoading ? (
        <ActivityIndicator animating={isStaffInfoListLoading} color="#FCF450" />
      ) : staffInfoListData?.isFailure ||
        staffInfoListData?.value.length == 0 ? (
        <Text>Không tìm thấy thông tin</Text>
      ) : (
        <View>
          <TouchableOpacity
            className="mt-2 flex-row px-[4px] py-[8px] border-2 border-gray-200 rounded-md"
            onPress={() =>
              setStaffInfo(staffInfoListData?.value[0].staffInfor || staffInfo)
            }
          >
            {staffInfo.id == 0 ? (
              <View className="mr-2">
                <Ionicons name="checkmark-circle" size={19} color="green" />
              </View>
            ) : (
              <View className="w-[18px] h-[18px] border-2 border-gray-200 mr-2 rounded-full" />
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
                  className="mt-2 flex-row px-[4px] py-[8px] border-2 border-gray-200 rounded-md"
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
                    <View className="w-[18px] h-[18px] border-2 border-gray-200 mr-2 rounded-full" />
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
        containerStyleClasses="mt-5 h-[36px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-psemibold z-10"
        textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
      />
    </View>
  );
};

export default OrderDeliveryAssign;
