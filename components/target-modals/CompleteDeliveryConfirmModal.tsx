import { View, Text, Image, Dimensions, Alert, Linking } from "react-native";
import React, { useEffect, useState } from "react";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import Modal from "react-native-modal";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import CONSTANTS from "@/constants/data";
import CustomButton from "../custom/CustomButton";
import useGlobalCompleteDeliveryConfirm from "@/hooks/states/useGlobalCompleteDeliveryConfirm";
import { router, useFocusEffect } from "expo-router";
import useGlobalMyPKGDetailsState from "@/hooks/states/useGlobalPKGDetailsState";
import AreaQRScanner from "../common/AreaQRScanner";
import apiClient from "@/services/api-services/api-client";
import Toast from "react-native-toast-message";
import utilService from "@/services/util-service";
import { getOrderStatusDescription } from "@/types/models/OrderFetchModel";
import * as Clipboard from "expo-clipboard";
import dayjs from "dayjs";
interface Props {
  containerStyleClasses?: string;
  titleStyleClasses?: string;
  imageStyleClasses?: string;
}
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;
interface QRCodeResultModel {
  OrderId: number;
  CustomerId: number;
  ShipperId: number;
  OrderDate: string;
  Token: string;
}
const CompleteDeliveryConfirmModal = ({
  containerStyleClasses = "",
  titleStyleClasses = "",
  imageStyleClasses = "",
}: Props) => {
  const globalPKGState = useGlobalMyPKGDetailsState();
  const globalCompleteDeliveryConfirm = useGlobalCompleteDeliveryConfirm();
  const { step, setStep } = globalCompleteDeliveryConfirm;
  const handleDeliverySuccess = async (
    data: string,
    onSuccess: () => void,
    onError: (error: any) => void
  ) => {
    const qrCodeResult: QRCodeResultModel = JSON.parse(data);
    return await apiClient
      .put(
        `shop-owner/order/${globalCompleteDeliveryConfirm.id}/delivered`,
        qrCodeResult
      )
      .then((response) => {
        // console.log(response.data);
        onSuccess();
        Toast.show({
          type: "success",
          text1: "Hoàn tất",
          text2: `Đã giao hàng thành công đơn MS-${globalCompleteDeliveryConfirm.id}`,
          // time: 15000
        });
        globalCompleteDeliveryConfirm.setIsModalVisible(false);
        globalCompleteDeliveryConfirm.onAfterCompleted();
        return true;
      })
      .catch((error: any) => {
        onError(error);
        return false;
      });
  };

  const selectActionStep = (
    <View>
      {globalCompleteDeliveryConfirm.model?.id && (
        <View className="mt-2 bg-white p-2">
          <Text className="text-[15px] text-gray-600 font-semibold">
            Thông tin nhận hàng
          </Text>

          <View className="mt-3 border-gray-300 border-[0.5px]" />
          <View className="py-2">
            <Text className="text-[14px] text-gray-700 font-semibold">
              {globalCompleteDeliveryConfirm.model.customer?.fullName}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert("Số điện thoại", "Bạn muốn gọi điện?", [
                  {
                    text:
                      "Gọi " +
                      globalCompleteDeliveryConfirm.model.customer?.phoneNumber,
                    onPress: () =>
                      Linking.openURL(
                        `tel:${globalCompleteDeliveryConfirm.model.customer?.phoneNumber}`
                      ),
                  },
                  {
                    text: "Sao chép",
                    onPress: () =>
                      Clipboard.setString(
                        globalCompleteDeliveryConfirm.model.customer
                          ?.phoneNumber
                      ),
                  },
                  { text: "Hủy", style: "cancel" },
                ]);
              }}
            >
              <Text className="text-[14px] text-gray-700 font-semibold text-[#0e7490]">
                {globalCompleteDeliveryConfirm.model.customer?.phoneNumber}
              </Text>
            </TouchableOpacity>
            <Text className="text-[14px] text-gray-700 font-semibold italic">
              {globalCompleteDeliveryConfirm.model?.buildingName}
            </Text>
          </View>
          <View className="mt-[4px]">
            <View className="flex-row justify-start items-center gap-2">
              <Text className="text-xs italic text-gray-500">Tóm tắt đơn:</Text>
              <Text className="text-xs italic text-gray-500">
                {globalCompleteDeliveryConfirm.model.foods[0].name}{" "}
                {globalCompleteDeliveryConfirm.model.foods[0].quantity > 1 &&
                  " x" + globalCompleteDeliveryConfirm.model.foods[0].quantity}
                {globalCompleteDeliveryConfirm.model.foods.length > 1 &&
                  " +" +
                    (globalCompleteDeliveryConfirm.model.foods.length - 1) +
                    " món khác"}
              </Text>
            </View>
            <View className="flex-row gap-x-1 items-center">
              <Text className="text-xs italic text-gray-500">Tổng tiền:</Text>
              <Text
                className={`text-[10px] font-medium me-2 px-2.5 py-1 rounded `}
              >
                {utilService.formatPrice(
                  globalCompleteDeliveryConfirm.model.totalPrice -
                    globalCompleteDeliveryConfirm.model.totalPromotion
                )}{" "}
                ₫
              </Text>
            </View>
          </View>
          <View className="mt-1 border-gray-300 border-[0.3px]" />
          <View className="py-2 ">
            <Text className="text-[14px] text-gray-700">Khung nhận hàng:</Text>
            <Text className="text-[14px] text-gray-700 font-semibold">
              {dayjs(
                globalCompleteDeliveryConfirm.model.intendedReceiveDate
              ).format("DD/MM/YYYY") +
                " | " +
                utilService.formatTime(
                  globalCompleteDeliveryConfirm.model.startTime
                ) +
                " - " +
                utilService.formatTime(
                  globalCompleteDeliveryConfirm.model.endTime
                )}
            </Text>
          </View>
        </View>
      )}

      <View className="mt-3 w-full items-center justify-between bg-white">
        <CustomButton
          title={`Giao thành công`}
          handlePress={() => {
            setStep(1);
          }}
          containerStyleClasses="w-full h-[42px] px-2 bg-transparent border-2 border-gray-200 bg-[#4ade80] border-[#86efac] font-semibold z-10"
          // iconLeft={
          //   <Ionicons name="filter-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[12px] text-center text-gray-900 ml-1 text-white text-gray-800"
        />
        <CustomButton
          title="Giao thất bại"
          handlePress={() => {
            setStep(2);
          }}
          containerStyleClasses="w-full mt-2 h-[40px] px-2 bg-transparent border-2 border-gray-200 border-[#fecaca] bg-[#fef2f2] font-semibold z-10 ml-1 "
          textStyleClasses="text-[12px] text-center text-gray-900 ml-1 text-white text-gray-700 text-[#f87171]"
        />
      </View>
    </View>
  );
  const confirmSuccessStep = (
    <View className="gap-y-2 py-2">
      <View className="mt-2 bg-gray-200 p-1 items-center justify-center rounded-xl">
        <AreaQRScanner
          innerDimension={280}
          handleQRCode={handleDeliverySuccess}
        />
      </View>
      <Text className="text-[12px] text-center text-green-500 font-semibold">
        Quét mã xác nhận giao thành công
      </Text>
      <TouchableOpacity
        onPress={() => setStep(0)}
        className="flex-row justify-center gap-x-2 p-2 border-[1px] border-gray-200 rounded-lg"
      >
        <Ionicons name="arrow-back-outline" size={14} color="#475569" />
        <Text className="text-[12px] text-center text-gray-600 font-semibold align-center">
          {"Quay lại"}
        </Text>
      </TouchableOpacity>
    </View>
  );
  const failSubmitStep = (
    <View className="gap-y-2 py-2">
      <TouchableOpacity
        onPress={() => setStep(0)}
        className="flex-row bg-primary justify-center gap-x-2 p-2 py-3 border-[1px] border-gray-200 rounded-xl"
      >
        <Text className="text-[14px] text-center text-white font-semibold align-center">
          Xác nhận giao hàng thất bại
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setStep(0)}
        className="flex-row justify-center gap-x-2 p-2 border-[1px] border-gray-200 rounded-lg"
      >
        <Ionicons name="arrow-back-outline" size={14} color="#475569" />
        <Text className="text-[12px] text-center text-gray-600 font-semibold align-center">
          {"Quay lại"}
        </Text>
      </TouchableOpacity>
    </View>
  );
  const stepComponents = [selectActionStep, confirmSuccessStep, failSubmitStep];
  return (
    <Modal
      isVisible={globalCompleteDeliveryConfirm.isModalVisible}
      onBackdropPress={() =>
        globalCompleteDeliveryConfirm.setIsModalVisible(false)
      }
    >
      <View style={{ zIndex: 100 }} className="justify-center items-center ">
        <View
          className={`w-80 bg-white p-1 rounded-lg p-4 ${containerStyleClasses}`}
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
          {stepComponents[step]}
        </View>
      </View>
      {/* <Toast position="bottom" /> */}
    </Modal>
  );
};

export default CompleteDeliveryConfirmModal;
