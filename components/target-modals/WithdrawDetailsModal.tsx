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
import { WithdrawalModel } from "@/types/models/WithdrawalModel";
import ValueResponse from "@/types/responses/ValueReponse";
import { useToast } from "react-native-toast-notifications";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
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

        globalWithdrawalState.setIsDetailsModalVisible(false);
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
  return (
    <Modal
      isVisible={globalWithdrawalState.isDetailsModalVisible}
      onBackdropPress={() =>
        globalWithdrawalState.setIsDetailsModalVisible(false)
      }
    >
      <View
        style={{ flex: 1, zIndex: 100 }}
        className="justify-center items-center"
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View
            className={`bg-white w-80 p-4 rounded-lg  ${containerStyleClasses}`}
          >
            <View className="flex-row items-center justify-between">
              <Text className={`${titleStyleClasses}`}>
                Yêu cầu rút tiền | RQ-{globalWithdrawalState.withdrawal.id}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  globalWithdrawalState.setIsDetailsModalVisible(false);
                }}
              >
                <Ionicons name="close-outline" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <View className="gap-y-2 mt-1">
              {/* <View>
                <Text className="font-bold">Trả lời</Text>
                <TextInput
                  className="border border-gray-300 mt-1 rounded p-2 h-16 bg-white"
                  placeholder="Nhập câu trả lời..."
                  value={request.comment}
                  onChangeText={(text) =>
                    setRequest({ ...request, comment: text })
                  }
                  multiline
                  placeholderTextColor="#888"
                />
              </View>
              <View className="flex-row gap-x-2 mt-1">
                <ImageUpload
                  containerStyleClasses="mt-2 w-full bg-red"
                  uri={
                    request.imageUrls.length == 0
                      ? CONSTANTS.url.pickNewImage
                      : request.imageUrls[0]
                  }
                  setUri={(uri: string) => {
                    setRequest({
                      ...request,
                      imageUrls: [uri],
                    });
                  }}
                  imageStyleObject={{ aspect: 1, width: 70, height: 70 }}
                  updateButton={
                    <CustomButton
                      title="Lưu"
                      containerStyleClasses="bg-white  bg-[#227B94] h-8"
                      textStyleClasses="text-sm text-white"
                      handlePress={() => {}}
                    />
                  }
                />
              </View> */}
              <CustomButton
                title="Hủy"
                isLoading={isLoading}
                handlePress={() =>
                  Alert.alert(
                    "Xác nhận",
                    `Bạn chắc chắn hủy yêu cầu RQ-${globalWithdrawalState.withdrawal.id} không?`,
                    [
                      {
                        text: "Không",
                        // style: "cancel",
                      },
                      {
                        text: "Xác nhận hủy",
                        onPress: async () => {
                          onCancel();
                        },
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
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default WithdrawDetailsModal;
