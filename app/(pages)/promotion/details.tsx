import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import CustomButton from "@/components/custom/CustomButton";
import CONSTANTS from "@/constants/data";
import usePromotionModelState from "@/hooks/states/usePromotionModelState";
import apiClient from "@/services/api-services/api-client";
import utilService from "@/services/util-service";
import PromotionModel, {
  PromotionApplyType,
  promotionApplyTypes,
} from "@/types/models/PromotionModel";
import ValueResponse from "@/types/responses/ValueReponse";
import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Image, Text, TextInput, View } from "react-native";
import { Switch, TouchableRipple } from "react-native-paper";
import { useToast } from "react-native-toast-notifications";

const PromotionDetails = () => {
  const toast = useToast();
  const isAnyRequestSubmit = useRef(false);
  const globalPromotionState = usePromotionModelState();
  //   const [promotion, setPromotion] = useState<PromotionModel>(
  //     globalPromotionState.promotion
  //   );
  const { promotion, setPromotion } = globalPromotionState;
  const [isFetching, setIsFetching] = useState(false);
  const getDetails = async (isRefetching = false) => {
    setIsFetching(true);
    try {
      const response = await apiClient.get<ValueResponse<PromotionModel>>(
        `shop-owner/promotion/${promotion.id}/detail`
      );
      globalPromotionState.setPromotion({ ...response.data.value });
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        Alert.alert("Oops!", "Không tìm thấy khuyến mãi này!");
        router.replace("/shop/promotion");
      } else {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
        );
        router.replace("/shop/promotion");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const onDelete = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn chắc chắn muốn xóa chương trình khuyến mãi này",
      [
        {
          text: "Đồng ý",
          onPress: async () => {
            apiClient
              .put("shop-owner/promotion/status/update", {
                id: promotion.id,
                status: 3,
              })
              .then((res) => {
                let result = res.data as ValueResponse<{
                  messsage: string;
                  promotionInfo: PromotionModel;
                }>;
                if (result.isSuccess) {
                  toast.show(`Hoàn tất xóa chương trình ${promotion.title}.`, {
                    type: "success",
                    duration: 1500,
                  });

                  // set to init
                  router.replace("/shop/promotion");
                  isAnyRequestSubmit.current = false;
                }
              })
              .catch((error: any) => {
                Alert.alert(
                  "Oops!",
                  error?.response?.data?.error?.message ||
                    "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                );
              });
          },
        },
        {
          text: "Hủy",
        },
      ]
    );
  };
  useFocusEffect(
    React.useCallback(() => {
      getDetails();
    }, [])
  );

  return (
    <PageLayoutWrapper>
      <View className="p-4 bg-gray">
        <View className="flex flex-row gap-4">
          <View className="flex-1 flex flex-col gap-3">
            <View className="mb-2">
              <Text className="font-bold">Tiêu đề *</Text>
              <TextInput
                className="border border-gray-300 mt-1 p-2 rounded"
                placeholder="Nhập tiêu đề chương trình khuyến mãi"
                value={promotion.title}
                readOnly
                placeholderTextColor="#888"
              />
            </View>

            <View className="mb-2">
              <Text className="font-bold">Mô tả</Text>
              <TextInput
                className="border border-gray-300 mt-1 p-2 rounded h-16"
                placeholder="Nhập mô tả chương trình khuyến mãi"
                value={promotion.description}
                readOnly
                multiline
                placeholderTextColor="#888"
              />
            </View>

            {/* </View> */}

            {/* <View className="flex-1 flex flex-col gap-4"> */}
            <View className="flex flex-row mt-2">
              <View className="flex-1">
                <Text className="font-bold">Thời gian bắt đầu *</Text>
                <View className="flex-row px-1 relative mt-2 gap-x-2">
                  <TouchableRipple
                    disabled
                    className="flex-1 border-2 border-gray-300 p-1 rounded-md"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-black mx-2 text-[14px]">
                        {dayjs(promotion.startDate).local().format("HH:mm")}{" "}
                        {dayjs(promotion.startDate)
                          .local()
                          .format("DD/MM/YYYY")}
                      </Text>

                      {/* <Ionicons
                        name="create-outline"
                        size={21}
                        color="gray-600"
                      /> */}
                    </View>
                  </TouchableRipple>

                  {/* <TouchableRipple
                    disabled
                    onPress={() => {}}
                    className="flex-1 border-2 border-gray-300 p-1 rounded-md"
                  >
                    <View className="flex-row justify-between items-center">
                      {promotion.startDate && (
                        <Text className="text-black mx-2 text-[16px]">
                          {dayjs(promotion.startDate).local().format("HH:mm")}
                        </Text>
                      )}

                      <Ionicons
                        name="create-outline"
                        size={21}
                        color="gray-600"
                      />
                    </View>
                  </TouchableRipple> */}
                </View>
              </View>

              <View className="flex-1">
                <Text className="font-bold">Thời gian kết thúc *</Text>
                <View className="flex-row px-1 relative mt-2 gap-x-2">
                  <TouchableRipple
                    onPress={() => {}}
                    className="flex-1 border-2 border-gray-300 p-1 rounded-md"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-black mx-2 text-[14px]">
                        {dayjs(promotion.endDate).local().format("HH:mm")}{" "}
                        {dayjs(promotion.endDate).local().format("DD/MM/YYYY")}
                      </Text>

                      {/* <Ionicons
                        name="create-outline"
                        size={21}
                        color="gray-600"
                      /> */}
                    </View>
                  </TouchableRipple>

                  {/* <TouchableRipple
                    disabled
                    onPress={() => {}}
                    className="flex-1 border-2 border-gray-300 p-1 rounded-md"
                  >
                    <View className="flex-row justify-between items-center">
                      {promotion.endDate && (
                        <Text className="text-black mx-2 text-[16px]">
                          {dayjs(promotion.endDate).local().format("HH:mm")}
                        </Text>
                      )}

                      <Ionicons
                        name="create-outline"
                        size={21}
                        color="gray-600"
                      /> 
                    </View>
                  </TouchableRipple> */}
                </View>
              </View>
            </View>

            <View className="mb-2">
              <Text className="font-bold mb-1">Loại áp dụng *</Text>
              <TextInput
                className="border border-gray-300 mt-1 p-2 rounded"
                placeholder="Nhập tỷ lệ giảm giá"
                value={
                  promotionApplyTypes.find(
                    (item) => item.key == promotion.applyType
                  )?.label || ""
                }
                readOnly
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
            </View>

            {promotion.applyType == PromotionApplyType.RateApply ? (
              <View className="mb-2">
                <Text className="font-bold">Tỷ lệ giảm giá (%) *</Text>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 mt-1 p-2 rounded"
                    placeholder="Nhập tỷ lệ giảm giá"
                    value={utilService.formatPrice(promotion.amountRate)}
                    readOnly
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                  />
                  {/* <Text className="absolute right-2 top-4 text-[12px] italic">
                    đồng
                  </Text> */}
                </View>
              </View>
            ) : (
              <View className="mb-2">
                <Text className="font-bold">Giá trị giảm giá *</Text>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 mt-1 p-2 rounded"
                    placeholder="Nhập giá trị giảm giá"
                    value={utilService.formatPrice(promotion.amountValue)}
                    readOnly
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-2 top-4 text-[12px] italic">
                    đồng
                  </Text>
                </View>
              </View>
            )}

            <View className="mb-2">
              <Text className="font-bold">Giá trị đơn hàng tối thiểu *</Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 mt-1 p-2 rounded"
                  placeholder="Nhập giá trị đơn hàng tối thiểu"
                  value={utilService.formatPrice(promotion.minOrdervalue)}
                  readOnly
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <Text className="absolute right-2 top-4 text-[12px] italic">
                  đồng
                </Text>
              </View>
            </View>
            {promotion.applyType != PromotionApplyType.AmountApply && (
              <View className="mb-2">
                <Text className="font-bold">
                  Giá trị khuyến mãi tối đa{" "}
                  {promotion.applyType != PromotionApplyType.AmountApply && "*"}
                </Text>
                <View className="relative">
                  <TextInput
                    className={`border border-gray-300 mt-1 p-2 rounded ${
                      promotion.applyType == PromotionApplyType.AmountApply
                        ? "opacity-50"
                        : ""
                    }`}
                    placeholder="Nhập giá trị khuyến mãi tối đa"
                    value={utilService.formatPrice(
                      promotion.applyType == PromotionApplyType.AmountApply
                        ? promotion.amountValue
                        : promotion.maximumApplyValue
                    )}
                    readOnly
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-2 top-4 text-[12px] italic">
                    đồng
                  </Text>
                </View>
              </View>
            )}

            <View className="mb-2">
              <Text className="font-bold">Giới hạn lượt sử dụng *</Text>
              <TextInput
                className="border border-gray-300 mt-1 p-2 rounded"
                placeholder="Nhập số lần sử dụng tối đa"
                value={promotion.usageLimit.toString()}
                readOnly
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
            </View>
            {/* Placeholder for ImageUploader */}
            <View className="mb-2">
              {/* <Text className="font-bold">Banner</Text> */}
              <Image
                resizeMode="cover"
                className="w-full h-[140px]"
                source={{
                  uri: promotion.bannerUrl || CONSTANTS.url.noImageAvailable,
                }}
              />
            </View>

            <View className="flex flex-row items-center gap-y-2">
              <Text className="font-semibold mr-3">Trạng thái khả dụng</Text>
              <Switch color="#e95137" value={promotion.status == 1} />
            </View>
            <CustomButton
              title="Chỉnh sửa"
              containerStyleClasses="mt-5 bg-secondary h-12"
              textStyleClasses="text-white"
              handlePress={() => {
                getDetails();
                router.push("/promotion/update");
              }}
            />
            <CustomButton
              title="Xóa khuyến mãi này"
              containerStyleClasses="mt-2 bg-white border-secondary border-[1px] h-11"
              textStyleClasses="text-secondary text-[16px]"
              handlePress={() => {
                onDelete();
              }}
            />
          </View>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default PromotionDetails;
