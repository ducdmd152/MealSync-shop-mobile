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
import useGlobalReviewReplyState from "@/hooks/states/useGlobalReviewReplyState";
import { useFocusEffect } from "expo-router";
import ImageUpload from "../common/ImageUpload";
import CustomButton from "../custom/CustomButton";
import apiClient from "@/services/api-services/api-client";
import PreviewMultiImagesUpload from "../images/PreviewMultiImagesUpload";
import utilService from "@/services/util-service";
import ImageViewingModal from "./ImageViewingModal";
interface Props {
  containerStyleClasses?: string;
  imageStyleClasses?: string;
  titleStyleClasses?: string;
}
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

interface ReviewReplyRequest {
  orderId: number;
  comment: string;
  imageUrls: string[];
}

const ReviewReplyModal = ({
  containerStyleClasses = "",
  titleStyleClasses = "",
  imageStyleClasses = "",
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const globalReviewReplyState = useGlobalReviewReplyState();
  const [isImageHandling, setImageHandling] = useState(true);
  const [request, setRequest] = useState<ReviewReplyRequest>({
    orderId: globalReviewReplyState.id,
    comment: "",
    imageUrls: [],
  } as ReviewReplyRequest);
  useFocusEffect(
    React.useCallback(() => {
      setRequest({
        orderId: globalReviewReplyState.id,
        comment: "",
        imageUrls: [],
      });
    }, [globalReviewReplyState])
  );
  const onSubmit = async () => {
    if (request.comment.length == 0) {
      Alert.alert("Oops", "Vui lòng điền câu trả lời!");
      return;
    }
    setIsSubmitting(true);
    await utilService.waitForCondition(() => !isImageHandling);
    try {
      const response = await apiClient.post(`shop-onwer/review`, {
        ...request,
      });
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        Alert.alert(
          "Hoàn tất",
          `Đã trả lời đánh giá của đơn hàng MS-${globalReviewReplyState.id}`
        );
        globalReviewReplyState.setIsModalVisible(false);
        globalReviewReplyState.onAfterCompleted();
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
  return (
    <Modal
      isVisible={globalReviewReplyState.isModalVisible}
      onBackdropPress={() => globalReviewReplyState.setIsModalVisible(false)}
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
                Trả lời nhận xét đơn hàng MS-{globalReviewReplyState.id}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  globalReviewReplyState.setIsModalVisible(false);
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
                  value={request.comment}
                  onChangeText={(text) =>
                    setRequest({ ...request, comment: text })
                  }
                  multiline
                  placeholderTextColor="#888"
                />
              </View>
              <PreviewMultiImagesUpload
                isImageHandling={isImageHandling}
                setIsImageHandling={setImageHandling}
                maxNumberOfPics={3}
                uris={request.imageUrls}
                setUris={(uris) => setRequest({ ...request, imageUrls: uris })}
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

export default ReviewReplyModal;
