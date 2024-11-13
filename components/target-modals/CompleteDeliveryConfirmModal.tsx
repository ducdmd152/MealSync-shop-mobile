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
import OrderFetchModel, {
  getOrderStatusDescription,
} from "@/types/models/OrderFetchModel";
import * as Clipboard from "expo-clipboard";
import dayjs from "dayjs";
import { TextInput } from "react-native";
import { DeliveryFailModel } from "@/types/models/DeliveryFailModel";
import PreviewMultiImagesUpload from "../images/PreviewMultiImagesUpload";
import EvidencePreviewMultiImagesUpload from "../images/EvidencePreviewMultiImagesUpload";
import { SelectList } from "react-native-dropdown-select-list";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageHandling, setImageHandling] = useState(true);
  const globalCompleteDeliveryConfirm = useGlobalCompleteDeliveryConfirm();
  const [order, setOrder] = useState<OrderFetchModel>();
  const { step, setStep } = globalCompleteDeliveryConfirm;
  const [request, setRequest] = useState<DeliveryFailModel>({
    reason: "",
    reasonIndentity: 1, // 1. Shop 2. Customer
    evidences: [],
  });
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

        globalCompleteDeliveryConfirm.onAfterCompleted();
        return true;
      })
      .catch((error: any) => {
        onError(error);
        return false;
      });
  };
  useEffect(() => {
    if (globalCompleteDeliveryConfirm.isModalVisible)
      setOrder(globalCompleteDeliveryConfirm.model);
  }, [globalCompleteDeliveryConfirm.model]);
  const selectActionStep = (
    <View>
      {order?.id && (
        <View className="mt-2 bg-white p-2">
          <Text className="text-[15px] text-gray-600 font-semibold">
            Thông tin nhận hàng
          </Text>

          <View className="mt-3 border-gray-300 border-[0.5px]" />
          <View className="py-2">
            <Text className="text-[14px] text-gray-700 font-semibold">
              {order.customer?.fullName}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert("Số điện thoại", "", [
                  {
                    text: "Gọi " + order.customer?.phoneNumber,
                    onPress: () =>
                      Linking.openURL(`tel:${order.customer?.phoneNumber}`),
                  },
                  {
                    text: "Sao chép",
                    onPress: () =>
                      Clipboard.setString(order.customer?.phoneNumber),
                  },
                  { text: "Hủy", style: "cancel" },
                ]);
              }}
            >
              <Text className="text-[14px] text-gray-700 font-semibold text-[#0e7490]">
                {order.customer?.phoneNumber}
              </Text>
            </TouchableOpacity>
            <Text className="text-[14px] text-gray-700 font-semibold italic">
              {order?.buildingName}
            </Text>
          </View>
          <View className="mt-[4px]">
            <View className="flex-row justify-start items-center gap-2">
              <Text className="text-xs italic text-gray-500">Tóm tắt đơn:</Text>
              <Text className="text-xs italic text-gray-500">
                {order.orderDetailSummary}
              </Text>
            </View>
            <View className="flex-row gap-x-1 items-center">
              <Text className="text-xs italic text-gray-500">Tổng tiền:</Text>
              <Text
                className={`text-[10px] font-medium me-2 px-2.5 py-1 rounded `}
              >
                {utilService.formatPrice(
                  order.totalPrice - order.totalPromotion
                )}{" "}
                ₫
              </Text>
            </View>
          </View>
          <View className="mt-1 border-gray-300 border-[0.3px]" />
          <View className="py-2 ">
            <Text className="text-[14px] text-gray-700">Khung nhận hàng:</Text>
            <Text className="text-[14px] text-gray-700 font-semibold">
              {dayjs(order.intendedReceiveDate).format("DD/MM/YYYY") +
                " | " +
                utilService.formatTime(order.startTime) +
                " - " +
                utilService.formatTime(order.endTime)}
            </Text>
          </View>
        </View>
      )}

      {globalCompleteDeliveryConfirm.actionComponents != null &&
        globalCompleteDeliveryConfirm.actionComponents}
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
      <View className="gap-y-2 mt-1">
        <View>
          <Text className="font-medium">Lí do</Text>
          <SelectList
            setSelected={(selected: number | string) =>
              setRequest({ ...request, reasonIndentity: Number(selected) })
            }
            data={[
              {
                key: 1,
                value: "Do phía cửa hàng",
              },
              {
                key: 2,
                value: "Do phía khách hàng",
              },
            ]}
            save="key"
            search={false}
            defaultOption={{
              key: 1,
              value: "Do phía cửa hàng",
            }}
          />
        </View>

        <View>
          <Text className="font-medium">Mô tả lí do</Text>
          <TextInput
            className="border border-gray-300 mt-1 rounded p-2 h-16 bg-white"
            placeholder="Nhập lí do..."
            value={request.reason}
            onChangeText={(text) => setRequest({ ...request, reason: text })}
            multiline
            placeholderTextColor="#888"
          />
        </View>
        <EvidencePreviewMultiImagesUpload
          isImageHandling={isImageHandling}
          setIsImageHandling={setImageHandling}
          maxNumberOfPics={3}
          uris={request.evidences}
          setUris={(uris) => setRequest({ ...request, evidences: uris })}
          imageWidth={80}
        />
      </View>
      <CustomButton
        title="Xác nhận giao hàng thất bại"
        isLoading={isSubmitting}
        containerStyleClasses="mt-5 bg-primary h-[40px]"
        textStyleClasses="text-white text-[14px]"
        handlePress={() => {}}
      />
      <TouchableOpacity
        onPress={() => setStep(0)}
        className="flex-row justify-center p-2 border-[1px] border-gray-200 rounded-lg"
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
              {globalCompleteDeliveryConfirm.title}
            </Text>
            {/* <TouchableOpacity
              onPress={() => {
                globalCompleteDeliveryConfirm.setIsModalVisible(false);
              }}
            >
              <Ionicons name="close-outline" size={24} color="gray" />
            </TouchableOpacity> */}
          </View>
          <View className="mt-2 justify-center items-center">
            {order != undefined && (
              <Text
                className={`text-[10px] font-medium me-2 px-2.5 py-0.5 rounded ${
                  getOrderStatusDescription(order.status)?.bgColor
                }`}
                style={{
                  backgroundColor: getOrderStatusDescription(order.status)
                    ?.bgColor,
                }}
              >
                {getOrderStatusDescription(order.status)?.description}
              </Text>
            )}
          </View>
          {stepComponents[step]}
        </View>
      </View>
      <Toast position="bottom" />
    </Modal>
  );
};

export default CompleteDeliveryConfirmModal;
