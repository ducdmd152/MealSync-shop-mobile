import apiClient from "@/services/api-services/api-client";
import { ReportReplyModel } from "@/types/models/ReportModel";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import CustomButton from "../custom/CustomButton";
import PreviewMultiImagesUpload from "../images/PreviewMultiImagesUpload";
import ImageViewingModal from "./ImageViewingModal";
interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  orderId: number;
  reportId: number;
  containerStyleClasses?: string;
  imageStyleClasses?: string;
  titleStyleClasses?: string;
  onAfterCompleted?: () => void;
}
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const ReportReplyModal = ({
  orderId,
  reportId,
  isOpen,
  setIsOpen,
  containerStyleClasses = "",
  titleStyleClasses = "",
  imageStyleClasses = "",
  onAfterCompleted = () => {},
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageHandling, setImageHandling] = useState(false);
  const [imageHandleError, setImageHandleError] = useState<any>(false);
  const [request, setRequest] = useState<ReportReplyModel>({
    replyReportId: 0,
    title: "no-title",
    content: "",
    images: [],
  });
  useFocusEffect(
    React.useCallback(() => {
      setRequest({
        replyReportId: reportId,
        title: "no-title",
        content: "",
        images: [],
      });
    }, [reportId])
  );
  useEffect(() => {
    if (!isImageHandling && isSubmitting) {
      if (imageHandleError) {
        setImageHandleError(false);
        setIsSubmitting(false);
        return;
      }
      subimitReply();
    }
  }, [isImageHandling]);
  const subimitReply = async () => {
    try {
      const response = await apiClient.post(`shop-owner/order/report/reply`, {
        ...request,
        replyReportId: reportId,
      });
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        Toast.show({
          type: "success",
          text1: `MS-${reportId}`,
          text2: `Đã trả lời báo cáo cho đơn MS-${orderId}.`,
        });
        setIsOpen(false);
        onAfterCompleted();
      }
    } catch (error: any) {
      console.log("error: ", error?.response?.data?.error);
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
    if (request.content.length == 0) {
      Alert.alert("Oops", "Vui lòng điền câu trả lời!");
      return;
    }
    setIsSubmitting(true);
    if (isImageHandling) return;
    if (imageHandleError) {
      setImageHandleError(false);
      setIsSubmitting(false);
      return;
    }
    subimitReply();
  };
  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={() => setIsOpen(false)}
      backdropOpacity={0.25}
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
                Trả lời báo cáo đơn hàng MS-{reportId}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsOpen(false);
                }}
              >
                <Ionicons name="close-outline" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <View className="gap-y-2 mt-1">
              <View>
                <Text className="font-bold">Trả lời</Text>
                <TextInput
                  className="border border-gray-300 mt-1 rounded p-2 h-16 bg-white"
                  placeholder="Nhập câu trả lời..."
                  value={request.content}
                  onChangeText={(text) =>
                    setRequest({ ...request, content: text })
                  }
                  multiline
                  placeholderTextColor="#888"
                />
              </View>
              <PreviewMultiImagesUpload
                imageHandleError={imageHandleError}
                setImageHandleError={setImageHandleError}
                isImageHandling={isImageHandling}
                setIsImageHandling={setImageHandling}
                maxNumberOfPics={3}
                uris={request.images}
                setUris={(uris) => setRequest({ ...request, images: uris })}
                imageWidth={80}
              />
              <CustomButton
                title="Hoàn tất trả lời"
                isLoading={isSubmitting}
                handlePress={() => onSubmit()}
                containerStyleClasses="mt-2 w-full h-[40px] px-4 bg-transparent border-2 border-gray-200 bg-secondary-100 font-semibold z-10"
                // iconLeft={
                //   <Ionicons name="add-circle-outline" size={21} color="white" />
                // }
                textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        <ImageViewingModal />
      </View>
    </Modal>
  );
};

export default ReportReplyModal;
