import { View, Text, Image, Dimensions } from "react-native";
import React from "react";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import Modal from "react-native-modal";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import CONSTANTS from "@/constants/data";
interface Props {
  containerStyleClasses?: string;
  imageStyleClasses?: string;
}
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const ImageViewingModal = ({
  containerStyleClasses = "",
  imageStyleClasses = "",
}: Props) => {
  const globalImageViewState = useGlobalImageViewingState();
  //   console.log(screenWidth, screenHeight);
  return (
    <Modal
      isVisible={globalImageViewState.isModalVisible}
      onBackdropPress={() => globalImageViewState.setIsModalVisible(false)}
    >
      <View style={{ zIndex: 100 }} className="justify-center items-center ">
        <View
          className={`bg-white p-1 rounded-lg ${containerStyleClasses} relative`}
        >
          {/* <View className="flex-row items-center justify-end">
            <TouchableOpacity
              onPress={() => {
                globalImageViewState.setIsModalVisible(false);
              }}
            >
              <Ionicons name="close-outline" size={24} color="gray" />
            </TouchableOpacity>
          </View> */}
          <Image
            source={{
              uri: globalImageViewState.url || CONSTANTS.url.noImageAvailable,
            }}
            className={`w-[${240}px] rounded-lg aspect-square ${imageStyleClasses}`}
            resizeMode="contain"
          />
          {globalImageViewState.description && (
            <Text className="italic mt-1 text-center text-yellow-600">
              {globalImageViewState.description}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ImageViewingModal;
