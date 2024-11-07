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
import React, { useState } from "react";
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
interface Props {
  containerStyleClasses?: string;

  titleStyleClasses?: string;
}
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const WithdrawDetailsModal = ({
  containerStyleClasses = "",
  titleStyleClasses = "",
}: Props) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const globalWithdrawalState = useGlobalWithdrawalState();

  const getDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ValueResponse<WithdrawalModel>>(
        `shop-owner/withdrawal//${globalWithdrawalState.withdrawal.id}`
      );
      globalWithdrawalState.setWithdrawal({ ...response.data.value });
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        Alert.alert("Oops!", "Không tìm thấy yêu cầu này!");
        globalWithdrawalState.setIsDetailsModalVisible(false);
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

  useFocusEffect(
    React.useCallback(() => {
      getDetails();
    }, [])
  );
  const onCancel = async (isConfirm: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await apiClient.put(`shop-owner/withdrawal/cancel`, {
        id: globalWithdrawalState.withdrawal.id,
        isConfirm: isConfirm,
      });
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        toast.show(`Đã hủy yêu cầu RQ-${globalWithdrawalState.withdrawal.id}`, {
          type: "success",
          duration: 1500,
        });
        globalWithdrawalState.setWithdrawal({
          ...globalWithdrawalState.withdrawal,
          status: WithdrawalStatus.Cancelled,
        });
        // globalWithdrawalState.setIsDetailsModalVisible(false);
        globalWithdrawalState.onAfterCancelCompleted();
      } else if (isWarning) {
        if (isConfirm) return;
        const warningInfo = value as WarningMessageValue;
        Alert.alert("Xác nhận", warningInfo.message, [
          {
            text: "Đồng ý",
            onPress: async () => {
              onCancel(true);
            },
          },
          {
            text: "Hủy",
          },
        ]);
      }
    } catch (error: any) {
      getDetails();
      console.log("error: ", error?.response?.data?.error);
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const balanceFetch = useFetchWithRQWithFetchFunc(
    [endpoints.BALANCE].concat(["withdrawal-page"]),
    async (): Promise<ValueResponse<BalanceModel>> =>
      apiClient.get(endpoints.BALANCE).then((response) => response.data),
    []
  );
  useFocusEffect(
    React.useCallback(() => {
      balanceFetch.refetch();
    }, [])
  );
  return (
    <Modal
      isVisible={globalWithdrawalState.isDetailsModalVisible}
      onBackdropPress={() =>
        globalWithdrawalState.setIsDetailsModalVisible(false)
      }
    >
      <View style={{ zIndex: 100 }} className="justify-center items-center">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View
            className={`bg-white w-80 p-4 rounded-lg  ${containerStyleClasses}`}
          >
            <View className="flex-row items-center justify-between">
              <Text className={`${titleStyleClasses}`}>
                Yêu cầu rút tiền | RQ-{globalWithdrawalState.withdrawal.id}
              </Text>
              <Text
                className="bg-blue-100 text-gray-800 text-[12px] font-medium me-2 px-2.5 py-0.5 rounded"
                style={{
                  backgroundColor:
                    withdrawalStatuses.find(
                      (item) =>
                        item.key === globalWithdrawalState.withdrawal.status
                    )?.bgColor || "#e5e5e5",
                }}
              >
                {withdrawalStatuses.find(
                  (item) => item.key === globalWithdrawalState.withdrawal.status
                )?.label || "------"}
              </Text>
              {/* <TouchableOpacity
                onPress={() => {
                  globalWithdrawalState.setIsDetailsModalVisible(false);
                }}
              >
                <Ionicons name="close-outline" size={24} color="gray" />
              </TouchableOpacity> */}
            </View>
            <View className="gap-y-2 mt-1">
              <View className="mb-2">
                <Text className="font-bold text-[12.8px]">
                  Số tiền cần rút *
                </Text>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 mt-1 px-3 pt-2 rounded text-[15px] pb-3"
                    placeholder="Số tiền cần rút"
                    value={utilService.formatPrice(
                      globalWithdrawalState.withdrawal.amount
                    )}
                    onChangeText={(text) => {}}
                    keyboardType="numeric"
                    readOnly
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-3 top-4 text-[12.8px] italic">
                    đồng
                  </Text>
                </View>
              </View>
              <View className="mb-2">
                <Text className="font-bold text-[12.8px]">Ngân hàng</Text>
                <TextInput
                  className="border border-gray-300 mt-1 p-2 rounded text-[15px]"
                  placeholder="Vui lòng chọn ngân hàng"
                  value={globalWithdrawalState.withdrawal.bankShortName}
                  readOnly
                  placeholderTextColor="#888"
                />
              </View>
              <View className="mb-2">
                <Text className="font-bold text-[12.8px]">Số tài khoản</Text>
                <TextInput
                  className="border border-gray-300 mt-1 p-2 px-3 rounded text-[15px]"
                  placeholder="Nhập số tài khoản..."
                  keyboardType="numeric"
                  value={globalWithdrawalState.withdrawal.bankAccountNumber}
                  placeholderTextColor="#888"
                  readOnly
                />
              </View>

              {globalWithdrawalState.withdrawal.status ==
                WithdrawalStatus.Approved &&
                globalWithdrawalState.withdrawal && (
                  <View>
                    <Text className="font-bold text-[12.8px]">
                      Số dư có sẵn
                    </Text>
                    <View className="flex-row gap-x-2 items-center mt-2">
                      <View className="flex-1 mb-2 relative">
                        <Text className="absolute text-[12.8px]  top-[-4px] left-3 bg-white z-10 italic">
                          Trước xử lí
                        </Text>
                        <TextInput
                          className="border border-gray-300 mt-1 px-3 pt-2 rounded text-[15px] pb-3"
                          placeholder="Số tiền cần rút"
                          value={utilService.formatPrice(
                            globalWithdrawalState.withdrawal.walletHistory
                              .avaiableAmountBefore
                          )}
                          onChangeText={(text) => {}}
                          keyboardType="numeric"
                          readOnly
                          placeholderTextColor="#888"
                        />
                        <Text className="absolute right-3 top-4 text-[12.8px] italic">
                          đ
                        </Text>
                      </View>
                      <View className="flex-1 mb-2 relative">
                        <Text className="absolute text-[12.8px]  top-[-4px] left-3 bg-white z-10 italic">
                          Sau xử lí
                        </Text>
                        <TextInput
                          className="border border-gray-300 mt-1 px-3 pt-2 rounded text-[15px] pb-3"
                          value={utilService.formatPrice(
                            globalWithdrawalState.withdrawal.walletHistory
                              .avaiableAmountAfter
                          )}
                          onChangeText={(text) => {}}
                          keyboardType="numeric"
                          readOnly
                          placeholderTextColor="#888"
                        />
                        <Text className="absolute right-3 top-4 text-[12.8px] italic">
                          đ
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              {globalWithdrawalState.withdrawal.status ==
                WithdrawalStatus.Rejected && (
                <View className="mb-2">
                  <Text className="font-bold">Lí do từ chối</Text>
                  <TextInput
                    className="border border-gray-300 mt-1 p-2 rounded h-16"
                    placeholder="Không có bất kì phản hồi nào..."
                    value={globalWithdrawalState.withdrawal.reason || ""}
                    multiline
                    readOnly
                    placeholderTextColor="#888"
                  />
                </View>
              )}

              {globalWithdrawalState.withdrawal.status ==
                WithdrawalStatus.Pending && (
                <CustomButton
                  title="Hủy yêu cầu"
                  isLoading={isLoading}
                  handlePress={() =>
                    Alert.alert(
                      "Xác nhận",
                      `Bạn chắc chắn hủy yêu cầu RQ-${globalWithdrawalState.withdrawal.id} không?`,
                      [
                        {
                          text: "Xác nhận hủy",
                          onPress: async () => {
                            onCancel(true);
                          },
                        },
                        {
                          text: "Không",
                          // style: "cancel",
                        },
                      ]
                    )
                  }
                  containerStyleClasses="mt-2 w-full h-[40px] px-4 bg-transparent border-2 border-gray-200 bg-secondary-100 font-psemibold z-10"
                  // iconLeft={
                  //   <Ionicons name="add-circle-outline" size={21} color="white" />
                  // }
                  textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default WithdrawDetailsModal;
