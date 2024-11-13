import { View, Text, Image, Dimensions } from "react-native";
import React from "react";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import Modal from "react-native-modal";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import CONSTANTS from "@/constants/data";
import CustomButton from "../custom/CustomButton";
import useGlobalCompleteDeliveryConfirm from "@/hooks/states/useGlobalCompleteDeliveryConfirm";
import { router } from "expo-router";
import useGlobalMyPKGDetailsState from "@/hooks/states/useGlobalPKGDetailsState";
import AreaQRScanner from "../common/AreaQRScanner";
interface Props {
  containerStyleClasses?: string;
  titleStyleClasses?: string;

  imageStyleClasses?: string;
}
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const CompleteDeliveryConfirmModal = ({
  containerStyleClasses = "",
  titleStyleClasses = "",
  imageStyleClasses = "",
}: Props) => {
  const globalPKGState = useGlobalMyPKGDetailsState();
  const globalCompleteDeliveryConfirm = useGlobalCompleteDeliveryConfirm();
  //   console.log(screenWidth, screenHeight);
  return (
    <Modal
      isVisible={globalCompleteDeliveryConfirm.isModalVisible}
      onBackdropPress={() =>
        globalCompleteDeliveryConfirm.setIsModalVisible(false)
      }
    >
      <View style={{ zIndex: 100 }} className="justify-center items-center ">
        <View
          className={`bg-white p-1 rounded-lg p-4 ${containerStyleClasses}`}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className={`flex-1 text-center font-semibold ${titleStyleClasses}`}
            >
              MS-{globalCompleteDeliveryConfirm.id} | Xác nhận giao hàng
            </Text>
            {/* <TouchableOpacity
              onPress={() => {
                globalCompleteDeliveryConfirm.setIsModalVisible(false);
              }}
            >
              <Ionicons name="close-outline" size={24} color="gray" />
            </TouchableOpacity> */}
          </View>
          <View className="mt-2">
            <AreaQRScanner innerDimension={300} />
          </View>
          <View className="w-full flex-row gap-x-2 items-center justify-between pt-3 px-2 bg-white">
            <View className="flex-1">
              <CustomButton
                title={`Giao thành công)`}
                handlePress={() => {}}
                containerStyleClasses="h-[44px] px-4 bg-transparent border-0 border-gray-200 bg-[#4ade80] font-semibold z-10"
                // iconLeft={
                //   <Ionicons name="filter-outline" size={21} color="white" />
                // }
                textStyleClasses="text-[12.8px] text-gray-900 ml-1 text-white text-gray-800"
              />
            </View>
            <View className="flex-1">
              <CustomButton
                title="Giao thất bại"
                handlePress={() => {}}
                containerStyleClasses="flex-1 h-[44px] px-4 bg-transparent border-0 border-gray-200 bg-[#fda4af] font-semibold z-10 ml-1 "
                textStyleClasses="text-[12.8px] text-gray-900 ml-1 text-white text-gray-700"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CompleteDeliveryConfirmModal;
