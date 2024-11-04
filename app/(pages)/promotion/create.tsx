import { View, Text, Alert, TextInput, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import PromotionModel, {
  initPromotionSampleObject,
  PromotionApplyType,
  promotionApplyTypes,
} from "@/types/models/PromotionModel";
import dayjs from "dayjs";
import apiClient from "@/services/api-services/api-client";
import ValueResponse from "@/types/responses/ValueReponse";
import { useToast } from "react-native-toast-notifications";
import { router } from "expo-router";
import { Switch } from "react-native-paper";
import DateTimePicker from "react-native-ui-datepicker";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import ImageUpload from "@/components/common/ImageUpload";
import CustomButton from "@/components/custom/CustomButton";
import { SelectList } from "react-native-dropdown-select-list";
import utilService from "@/services/util-service";

const PromotionCreate = () => {
  const toast = useToast();
  const isAnyRequestSubmit = useRef(false);
  const [promotion, setPromotion] = useState<PromotionModel>({
    ...initPromotionSampleObject,
    bannerUrl: "",
  });

  const [errors, setErrors] = useState<any>({});
  const validate = (promotion: PromotionModel) => {
    console.log("Validating promotion: ", promotion);
    let tempErrors: any = {};
    if (promotion.title.length < 6)
      tempErrors.title = "Tiêu đề ít nhất 6 kí tự.";
    if (
      promotion.applyType == PromotionApplyType.RateApply &&
      (promotion.amountRate < 1 || promotion.amountRate > 100)
    )
      tempErrors.amountRate =
        "Tỉ lệ giảm giá nằm trong khoảng từ 1 đến 100 (%).";
    if (promotion.minimumOrderValue < 1000)
      tempErrors.minimumOrderValue =
        "Giá trị đơn hàng tối thiểu lớn hơn hoặc bằng 1000 đồng.";
    if (promotion.maximumApplyValue < 0)
      tempErrors.maximumApplyValue =
        "Giá trị áp dụng tối đa cần lớn hơn hoặc bằng 0.";
    if (
      promotion.applyType == PromotionApplyType.AmountApply &&
      promotion.amountValue < 1000
    )
      tempErrors.amountValue =
        "Giá trị giảm giá cần lớn hơn hoặc bằng 1000 đồng.";
    if (
      promotion.applyType == PromotionApplyType.AmountApply &&
      promotion.amountValue > 10_000_000
    )
      tempErrors.amountValue = "Giá trị khuyến mãi không vượt quá 10.000.000đ.";
    if (new Date(promotion.startDate) > new Date(promotion.endDate))
      tempErrors.startDate =
        "Thời gian bắt đầu cần trước hoặc bằng ngày kết thúc";
    if (promotion.usageLimit < 0)
      tempErrors.usageLimit = "Giới hạn lượt sử dụng lớn hơn hoặc bằng 0.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const numericFields = [
    "id",
    "amountRate",
    "minimumOrderValue",
    "maximumApplyValue",
    "amountValue",
    "applyType",
    "status",
    "usageLimit",
    "numberOfUsed",
    "promotionType",
  ];
  const handleChange = (name: string, value: string) => {
    const newValue = numericFields.includes(name)
      ? Number(utilService.parseFormattedNumber(value))
      : value;

    if (isAnyRequestSubmit.current) {
      validate({
        ...promotion,
        [name]: newValue,
      });
    }

    setPromotion((prevPromotion) => ({
      ...prevPromotion,
      [name]: newValue,
    }));
    console.log({
      ...promotion,
      [name]: newValue,
    });
  };
  const handleSubmit = () => {
    isAnyRequestSubmit.current = true;
    console.log("Promotion details:", promotion, validate(promotion), errors);
    if (validate(promotion)) {
      promotion.startDate = dayjs(promotion.startDate).toISOString();
      promotion.endDate = dayjs(promotion.endDate).toISOString();
      apiClient
        .post("shop-owner/promotion/create", promotion)
        .then((res) => {
          let result = res.data as ValueResponse<PromotionModel>;
          if (result.isSuccess) {
            toast.show(`Hoàn tất tạo mới khuyến mãi thành công.`, {
              type: "success",
              duration: 1500,
            });

            // set to init
            router.push("shop/promotion");
            isAnyRequestSubmit.current = false;
            setPromotion({ ...initPromotionSampleObject, bannerUrl: "" });
          }
        })
        .catch((error: any) => {
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!"
          );
        });
      promotion.startDate = dayjs(promotion.startDate).format("YYYY-MM-DD");
      promotion.endDate = dayjs(promotion.endDate).format("YYYY-MM-DD");
    } else {
      Alert.alert("Oops!", "Vui lòng hoàn thành thông tin một cách hợp lệ");
    }
  };
  console.log(
    "promotion.applyType",
    promotion.applyType,
    promotion.applyType == PromotionApplyType.RateApply
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
                onChangeText={(text) => handleChange("title", text)}
                placeholderTextColor="#888"
              />
              {errors.title && (
                <Text className="text-red-500 text-xs">{errors.title}</Text>
              )}
            </View>

            <View className="mb-2">
              <Text className="font-bold">Mô tả</Text>
              <TextInput
                className="border border-gray-300 mt-1 p-2 rounded h-16"
                placeholder="Nhập mô tả chương trình khuyến mãi"
                value={promotion.description}
                onChangeText={(text) => handleChange("description", text)}
                multiline
                placeholderTextColor="#888"
              />
            </View>

            {/* </View> */}

            {/* <View className="flex-1 flex flex-col gap-4"> */}
            <View className="flex flex-row gap-2">
              <View className="flex-1">
                <Text className="font-bold">Thời gian bắt đầu</Text>
                {/* <DateTimePicker
                date={new Date(promotion.startDate)}
                mode="single"
                onChange={(params) =>
                  params.date &&
                  handleChange("startDate", dayjs(params.date).toISOString())
                }
              /> */}
              </View>

              <View className="flex-1">
                <Text className="font-bold">Thời gian kết thúc</Text>
                {/* <DateTimePicker
                date={new Date(promotion.endDate)}
                mode="single"
                onChange={(params) =>
                  params.date &&
                  handleChange("endDate", dayjs(params.date).toISOString())
                }
              /> */}
              </View>
            </View>

            {errors.startDate && (
              <Text className="text-red-500 text-xs">{errors.startDate}</Text>
            )}

            <View className="mb-2">
              <Text className="font-bold mb-1">Loại áp dụng</Text>
              <SelectList
                setSelected={(value: string | number) =>
                  setPromotion({ ...promotion, applyType: Number(value) })
                }
                data={
                  promotionApplyTypes?.map((item) => ({
                    key: item.key.toString(),
                    value: item.label,
                  })) || []
                }
                save="key"
                search={false}
                notFoundText="Không tìm thấy"
                placeholder="Loại áp dụng"
                searchPlaceholder="Tìm kiếm..."
              />
            </View>

            {promotion.applyType == PromotionApplyType.RateApply ? (
              <View className="mb-2">
                <Text className="font-bold">Tỷ lệ giảm giá (%)</Text>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 mt-1 p-2 rounded"
                    placeholder="Nhập tỷ lệ giảm giá"
                    value={utilService.formatPrice(promotion.amountRate)}
                    onChangeText={(text) => handleChange("amountRate", text)}
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                  />
                  {/* <Text className="absolute right-2 top-2 text-[12px] italic">
                    đồng
                  </Text> */}
                </View>

                {errors.amountRate && (
                  <Text className="text-red-500 text-xs">
                    {errors.amountRate}
                  </Text>
                )}
              </View>
            ) : (
              <View className="mb-2">
                <Text className="font-bold">Giá trị giảm giá</Text>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 mt-1 p-2 rounded"
                    placeholder="Nhập giá trị giảm giá"
                    value={utilService.formatPrice(promotion.amountValue)}
                    onChangeText={(text) => handleChange("amountValue", text)}
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-2 top-2 text-[12px] italic">
                    đồng
                  </Text>
                </View>

                {errors.amountValue && (
                  <Text className="text-red-500 text-xs">
                    {errors.amountValue}
                  </Text>
                )}
              </View>
            )}

            <View className="mb-2">
              <Text className="font-bold">Giá trị đơn hàng tối thiểu</Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 mt-1 p-2 rounded"
                  placeholder="Nhập giá trị đơn hàng tối thiểu"
                  value={utilService.formatPrice(promotion.minimumOrderValue)}
                  onChangeText={(text) =>
                    handleChange("minimumOrderValue", text)
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <Text className="absolute right-2 top-2 text-[12px] italic">
                  đồng
                </Text>
              </View>

              {errors.minimumOrderValue && (
                <Text className="text-red-500 text-xs">
                  {errors.minimumOrderValue}
                </Text>
              )}
            </View>
            <View className="mb-2">
              <Text className="font-bold">Giá trị khuyến mãi tối đa</Text>
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
                  onChangeText={(text) =>
                    handleChange("maximumApplyValue", text)
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                  readOnly={
                    promotion.applyType == PromotionApplyType.AmountApply
                  }
                />
                <Text className="absolute right-2 top-2 text-[12px] italic">
                  đồng
                </Text>
              </View>
              {errors.minimumOrderValue && (
                <Text className="text-red-500 text-xs">
                  {errors.minimumOrderValue}
                </Text>
              )}
            </View>
            <View className="mb-2">
              <Text className="font-bold">Giới hạn lượt sử dụng</Text>
              <TextInput
                className="border border-gray-300 mt-1 p-2 rounded"
                placeholder="Nhập số lần sử dụng tối đa"
                value={promotion.usageLimit.toString()}
                onChangeText={(text) => handleChange("usageLimit", text)}
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
              {errors.minimumOrderValue && (
                <Text className="text-red-500 text-xs">
                  {errors.minimumOrderValue}
                </Text>
              )}
            </View>
            {/* Placeholder for ImageUploader */}
            <View className="mb-2">
              <Text className="font-bold">Banner</Text>
              <ImageUpload
                containerStyleClasses="mt-2 w-full bg-red"
                uri={promotion.bannerUrl}
                setUri={(uri: string) => {
                  setPromotion({
                    ...promotion,
                    bannerUrl: promotion.bannerUrl,
                  });
                }}
                imageStyleObject={{ height: 140, width: "100%" }}
                updateButton={
                  <CustomButton
                    title="Lưu"
                    containerStyleClasses="bg-white  bg-[#227B94] h-8"
                    textStyleClasses="text-sm text-white"
                    handlePress={() => {}}
                  />
                }
              />
            </View>

            <View className="flex flex-row items-center gap-2">
              <Text>Trạng thái khả dụng</Text>
              <Switch
                value={(promotion.status || 0).toString() == "Active"}
                onValueChange={(value) =>
                  setPromotion({
                    ...promotion,
                    status: value ? 1 : 2,
                  })
                }
              />
            </View>
            <CustomButton
              title="Hoàn tất tạo mới"
              containerStyleClasses="mt-5 bg-secondary h-12"
              textStyleClasses="text-white"
              handlePress={() => {
                handleSubmit();
              }}
            />
          </View>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default PromotionCreate;
