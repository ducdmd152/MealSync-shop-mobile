import useGlobalReviewReplyState from "@/hooks/states/useGlobalReviewReplyState";
import apiClient from "@/services/api-services/api-client";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
} from "react-native";
import Modal from "react-native-modal";
import CustomButton from "../custom/CustomButton";
import PreviewMultiImagesUpload from "../images/PreviewMultiImagesUpload";
import ImageViewingModal from "./ImageViewingModal";
interface Props {
  orderId: number;
  containerStyleClasses?: string;
  imageStyleClasses?: string;
  titleStyleClasses?: string;
  request: (reason: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const OrderCancelModal = ({
  isOpen,
  setIsOpen,
  orderId,
  request,
  containerStyleClasses = "",
  titleStyleClasses = "",
  imageStyleClasses = "",
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  useFocusEffect(
    React.useCallback(() => {
      setReason("");
    }, [])
  );
  return (
    <Modal isVisible={isOpen} onBackdropPress={() => setIsOpen(false)}>
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
                Hủy đơn hàng MS-{orderId}
              </Text>
              {/* <TouchableOpacity
                onPress={() => {
                  setIsOpen(false);
                }}
              >
                <Ionicons name="close-outline" size={24} color="gray" />
              </TouchableOpacity> */}
            </View>
            <View className="gap-y-2 mt-1">
              <View>
                <Text className="font-bold">Lí do hủy</Text>
                <TextInput
                  className="border border-gray-300 mt-1 rounded p-2 h-16 bg-white"
                  placeholder="Nhập câu trả lời..."
                  value={reason}
                  onChangeText={(text) => setReason(text)}
                  multiline
                  placeholderTextColor="#888"
                />
              </View>
              <CustomButton
                title="Xác nhận hủy đơn"
                isLoading={isSubmitting}
                handlePress={() => request(reason)}
                containerStyleClasses="mt-2 w-full h-[40px] px-4 bg-transparent border-2 border-gray-200 bg-secondary-100 font-semibold z-10"
                // iconLeft={
                //   <Ionicons name="add-circle-outline" size={21} color="white" />
                // }
                textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
              />
              <CustomButton
                title="Thoát"
                isLoading={isSubmitting}
                handlePress={() => setIsOpen(false)}
                containerStyleClasses="mt-2 w-full h-[36px] px-4 bg-transparent border-2 bg-white border-secondary-100 z-10"
                // iconLeft={
                //   <Ionicons name="add-circle-outline" size={21} color="white" />
                // }
                textStyleClasses="text-[14px] text-gray-900 ml-1 text-white text-secondary-100"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        <ImageViewingModal />
      </View>
    </Modal>
  );
};

export default OrderCancelModal;
