import {
  View,
  Text,
  Image,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import Modal from "react-native-modal";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import CONSTANTS from "@/constants/data";
import { router, useFocusEffect } from "expo-router";
import ImageUpload from "../common/ImageUpload";
import CustomButton from "../custom/CustomButton";
import apiClient from "@/services/api-services/api-client";
import useGlobalWithdrawalState from "@/hooks/states/useGlobalWithdrawalState";
import {
  WithdrawalModel,
  WithdrawalStatus,
  withdrawalStatuses,
} from "@/types/models/WithdrawalModel";
import ValueResponse from "@/types/responses/ValueReponse";
import { useToast } from "react-native-toast-notifications";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import utilService from "@/services/util-service";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import { endpoints } from "@/services/api-services/api-service-instances";
import { BalanceModel } from "@/types/models/BalanceModel";
import {
  ShopDeliveryStaffModel,
  ShopDeliveryStaffStatus,
} from "@/types/models/StaffInfoModel";
import { Switch } from "react-native-paper";
import useGlobalStaffState from "@/hooks/states/useGlobalStaffState";
import dayjs from "dayjs";
interface Props {
  containerStyleClasses?: string;

  titleStyleClasses?: string;
}
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const StaffDetailsModal = ({
  containerStyleClasses = "",
  titleStyleClasses = "",
}: Props) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const globalStaffState = useGlobalStaffState();

  const getDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<
        ValueResponse<ShopDeliveryStaffModel>
      >(`shop-owner/delivery-staff/${globalStaffState.model.id}`);
      globalStaffState.setModel({ ...response.data.value });
    } catch (error: any) {
      if (error.response && error.response.status == 404) {
        Alert.alert("Oops!", "Không tìm thấy yêu cầu này!");
        globalStaffState.setIsDetailsModalVisible(false);
      } else {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (globalStaffState.isDetailsModalVisible) getDetails();
  }, [globalStaffState.isDetailsModalVisible]);
  useFocusEffect(React.useCallback(() => {}, []));
  const onChangeStaffStatusSubmit = async (
    staff: ShopDeliveryStaffModel,
    onSuccess: () => void
  ) => {
    setIsSubmitting(true);
    await apiClient
      .put(`shop-owner/delivery-staff/status`, {
        id: staff.id,
        isConfirm: true,
        status: staff.shopDeliveryStaffStatus,
      })
      .then((response) => {
        const { value, isSuccess, isWarning, error } = response.data;
        if (isSuccess) {
          onSuccess();
        }
      })
      .catch((error: any) => {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const getStaffStatusComponent = (staff: ShopDeliveryStaffModel) => {
    let label = "";
    let bgColor = "";
    let isSwitchOn = true;
    let onSwitchTouch = () => {};
    switch (staff.shopDeliveryStaffStatus) {
      case ShopDeliveryStaffStatus.On:
        label = "Hoạt động";
        bgColor = "#7dd3fc";
        isSwitchOn = true;
        break;
      case ShopDeliveryStaffStatus.Off:
        label = "Nghỉ phép";
        bgColor = "#fde047";
        isSwitchOn = false;

        break;
      case ShopDeliveryStaffStatus.Inactive:
        label = "Đã khóa";
        bgColor = "#cbd5e1";
        isSwitchOn = false;
        break;
    }
    if (staff.shopDeliveryStaffStatus == 1) {
      onSwitchTouch = () => {
        Alert.alert(
          `Xác nhận`,
          `Bạn muốn chuyển trạng thái của ${staff.fullName} sang nghỉ phép hay khóa tài khoản?`,
          [
            {
              text: "Chuyển sang nghỉ phép",
              onPress: async () => {
                onChangeStaffStatusSubmit(
                  { ...staff, shopDeliveryStaffStatus: 2 },
                  () => {
                    globalStaffState.setModel({
                      ...staff,
                      shopDeliveryStaffStatus: 2,
                    });
                    toast.show(
                      `Đã chuyển ${staff.fullName} sang trạng thái nghỉ phép`,
                      {
                        type: "success",
                        duration: 2000,
                      }
                    );
                  }
                );
              },
            },
            {
              text: "Khóa tài khoản",
              onPress: async () => {
                onChangeStaffStatusSubmit(
                  { ...staff, shopDeliveryStaffStatus: 3 },
                  () => {
                    globalStaffState.setModel({
                      ...staff,
                      shopDeliveryStaffStatus: 3,
                    });
                    toast.show(`Đã khóa tài khoản ${staff.fullName} `, {
                      type: "info",
                      duration: 2000,
                    });
                  }
                );
              },
            },
            {
              text: "Hủy",
            },
          ]
        );
      };
    } else {
      onSwitchTouch = () => {
        Alert.alert(
          `Xác nhận`,
          staff.shopDeliveryStaffStatus == 2
            ? `Chuyển trạng thái của ${staff.fullName} sang trạng thái hoạt động?`
            : `Xác nhận mở khóa tài khoản ${staff.fullName}?`,
          [
            {
              text: `Xác nhận`,
              onPress: async () => {
                onChangeStaffStatusSubmit(
                  { ...staff, shopDeliveryStaffStatus: 1 },
                  () => {
                    globalStaffState.setModel({
                      ...staff,
                      shopDeliveryStaffStatus: 1,
                    });
                    toast.show(
                      `Đã chuyển trạng thái của ${staff.fullName} sang trạng thái hoạt động`,
                      {
                        type: "success",
                        duration: 2000,
                      }
                    );
                  }
                );
              },
            },
            {
              text: "Hủy",
            },
          ]
        );
      };
    }
    return (
      <View
        className="flex-row items-center rounded-lg w-28"
        style={{ backgroundColor: "#fefce8" }}
      >
        <View className="scale-50 h-6 items-center justify-center ml-[-4px]">
          <Switch
            color="#22c55e"
            value={staff.shopDeliveryStaffStatus == 1}
            onValueChange={(value) => {
              onSwitchTouch();
            }}
          />
        </View>
        <Text className="text-[11px] italic text-gray-500 mr-2 ml-[-4px]">
          {label}
        </Text>
      </View>
    );
  };
  return (
    <Modal
      isVisible={globalStaffState.isDetailsModalVisible}
      onBackdropPress={() => globalStaffState.setIsDetailsModalVisible(false)}
    >
      <View style={{ zIndex: 100 }} className="justify-center items-center">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View
            className={`bg-white w-80 p-4 rounded-lg  ${containerStyleClasses}`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`${titleStyleClasses}`}>
                  Thông tin nhân viên
                </Text>
                <Text className="text-[11px] italic text-gray-500 mt-[4px]">
                  Đã thêm vào{" "}
                  {dayjs(globalStaffState.model.createdDate)
                    .local()
                    .format("HH:mm DD/MM/YYYY")}{" "}
                </Text>
              </View>

              {getStaffStatusComponent(globalStaffState.model)}
            </View>
            <View className="gap-y-2 mt-1">
              <View className="mb-2">
                <Text className="font-bold text-[12.8px]">Tên nhân viên</Text>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 mt-1 px-3 pt-2 rounded text-[15px] pb-3"
                    value={globalStaffState.model.fullName}
                    onChangeText={(text) => {}}
                    keyboardType="numeric"
                    readOnly
                    placeholderTextColor="#888"
                  />
                  {/* <Text className="absolute right-3 top-4 text-[12.8px] italic">
                    đồng
                  </Text> */}
                </View>
              </View>
              <View className="mb-2">
                <Text className="font-bold text-[12.8px]">Email</Text>
                <TextInput
                  className="border border-gray-300 mt-1 p-2 rounded text-[15px]"
                  value={globalStaffState.model.email}
                  readOnly
                  placeholderTextColor="#888"
                />
              </View>
              <View className="mb-2">
                <Text className="font-bold text-[12.8px]">Số điện thoại</Text>
                <TextInput
                  className="border border-gray-300 mt-1 p-2 rounded text-[15px]"
                  value={globalStaffState.model.phoneNumber}
                  readOnly
                  placeholderTextColor="#888"
                  placeholder="Chưa có thông tin"
                />
              </View>

              <CustomButton
                title="Chỉnh sửa thông tin"
                isLoading={isLoading}
                handlePress={() => {}}
                containerStyleClasses="mt-2 w-full h-[40px] px-4 bg-transparent border-2 border-gray-200 bg-secondary-100 font-psemibold z-10"
                // iconLeft={
                //   <Ionicons name="add-circle-outline" size={21} color="white" />
                // }
                textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default StaffDetailsModal;
