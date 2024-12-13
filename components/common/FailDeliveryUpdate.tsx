import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, View, TouchableOpacity } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";

import CustomButton from "../custom/CustomButton";
import EvidencePreviewMultiImagesUpload from "../images/EvidencePreviewMultiImagesUpload";
import {
  DeliveryFailModel,
  OrderDeliveryInfoModel,
} from "@/types/models/DeliveryInfoModel";
import apiClient from "@/services/api-services/api-client";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "expo-router";
interface Props {
  order: OrderFetchModel;
  failDeliveryInfo: OrderDeliveryInfoModel;
  afterCompleted: () => void;
  cancel: () => void;
}
const FailDeliveryUpdate = ({
  order,
  failDeliveryInfo,
  afterCompleted,
  cancel,
}: Props) => {
  const [isImageHandling, setImageHandling] = useState(false);
  const [imageHandleError, setImageHandleError] = useState<any>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [request, setRequest] = useState<DeliveryFailModel>({
    reason: "",
    reasonIndentity: 1, // 1. Shop 2. Customer
    evidences: [],
  });
  useEffect(() => {
    if (!isImageHandling && isSubmitting) {
      if (imageHandleError) {
        setImageHandleError(false);
        setIsSubmitting(false);
        return;
      }
      requestFailDelivery();
    }
  }, [isImageHandling]);
  useFocusEffect(
    React.useCallback(() => {
      setRequest({ ...failDeliveryInfo.deliveryFaileEvidence });
    }, [])
  );
  const requestFailDelivery = () => {
    console.log("request data: ", request);
    apiClient
      .put(
        `shop-owner-staff/order/${failDeliveryInfo.id}/delivery-fail`,
        request
      )
      .then((response) => {
        afterCompleted();
        Toast.show({
          type: "info",
          text1: "Hoàn tất",
          text2: `MS-${failDeliveryInfo.id} | Đã cập nhật lí do giao thất bại`,
          // time: 15000
        });
        return true;
      })
      .catch((error: any) => {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
        );
        return false;
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const submitFailDelivery = async () => {
    if (request.reason.trim().length == 0) {
      Alert.alert("Vui lòng thông mô tả tương tứng với lí do đã chọn.");
      return;
    }

    setIsSubmitting(true);
    if (isImageHandling) return;

    if (imageHandleError) {
      setImageHandleError(false);
      setIsSubmitting(false);
      return;
    }
    requestFailDelivery();
  };
  return (
    <View className="gap-y-2 py-2">
      <View className="gap-y-2 mt-1">
        <View>
          <Text className="font-medium mb-1">Lí do</Text>
          <SelectList
            setSelected={(selected: number | string) => {
              // console.log("selected : ", selected);
              setRequest({ ...request, reasonIndentity: Number(selected) });
            }}
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
              key: failDeliveryInfo.deliveryFaileEvidence.reasonIndentity,
              value:
                failDeliveryInfo.deliveryFaileEvidence.reasonIndentity == 1
                  ? "Do phía cửa hàng"
                  : "Do phía khách hàng",
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
          imageHandleError={imageHandleError}
          setImageHandleError={setImageHandleError}
          isImageHandling={isImageHandling}
          setIsImageHandling={setImageHandling}
          maxNumberOfPics={3}
          uris={request.evidences}
          setUris={(uris) => setRequest({ ...request, evidences: uris })}
          imageWidth={80}
        />
      </View>
      <CustomButton
        title="Cập nhật"
        isLoading={isSubmitting}
        containerStyleClasses="mt-5 bg-primary h-[40px]"
        textStyleClasses="text-white text-[14px]"
        handlePress={() => {
          submitFailDelivery();
        }}
      />
      <TouchableOpacity
        onPress={() => cancel()}
        className="flex-row justify-center p-2 border-[1px] border-gray-200 rounded-lg"
      >
        {/* <Ionicons name="arrow-back-outline" size={14} color="#475569" /> */}
        <Text className="text-[12px] text-center text-gray-600 font-semibold align-center">
          {"Hủy"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FailDeliveryUpdate;
