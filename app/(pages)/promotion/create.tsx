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
import { Switch, TouchableRipple } from "react-native-paper";
import DateTimePicker from "react-native-ui-datepicker";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import ImageUpload from "@/components/common/ImageUpload";
import CustomButton from "@/components/custom/CustomButton";
import { SelectList } from "react-native-dropdown-select-list";
import utilService from "@/services/util-service";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import usePromotionModelState from "@/hooks/states/usePromotionModelState";
// Initialize the timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const PromotionCreate = () => {
  const globalPromotionState = usePromotionModelState();
  const toast = useToast();
  const isAnyRequestSubmit = useRef(false);
  const [promotion, setPromotion] = useState<PromotionModel>({
    ...initPromotionSampleObject,
    bannerUrl: "",
  });
  const [isFromDatePickerVisible, setFromDatePickerVisibility] =
    useState(false);
  const [isFromTimePickerVisible, setFromTimePickerVisibility] =
    useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
  const [isToTimePickerVisible, setToTimePickerVisibility] = useState(false);
  const toggleFromDatePicker = () => {
    setFromDatePickerVisibility(!isFromDatePickerVisible);
  };
  const toggleToDatePicker = () => {
    setToDatePickerVisibility(!isToDatePickerVisible);
  };

  const [errors, setErrors] = useState<any>({});
  const validate = (promotion: PromotionModel) => {
    // console.log("Validating promotion: ", promotion);
    let tempErrors: any = {};
    if (promotion.title.length < 6)
      tempErrors.title = "Tiêu đề ít nhất 6 kí tự.";
    if (
      promotion.applyType == PromotionApplyType.RateApply &&
      (promotion.amountRate < 1 || promotion.amountRate > 100)
    )
      tempErrors.amountRate =
        "Tỉ lệ giảm giá nằm trong khoảng từ 1 đến 100 (%).";
    if (promotion.minOrdervalue < 1000)
      tempErrors.minOrdervalue =
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
    "minOrdervalue",
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
    // console.log({
    //   ...promotion,
    //   [name]: newValue,
    // });
  };
  const handleSubmit = () => {
    isAnyRequestSubmit.current = true;
    const submitPromotion =
      promotion.applyType == PromotionApplyType.AmountApply
        ? { ...promotion, amountRate: 0, maximumApplyValue: 0 }
        : { ...promotion, amountValue: 0 };
    if (validate(promotion)) {
      apiClient
        .post("shop-owner/promotion/create", submitPromotion)
        .then((res) => {
          let result = res.data as ValueResponse<{
            messsage: string;
            promotionInfo: PromotionModel;
          }>;
          if (result.isSuccess) {
            toast.show(`Hoàn tất tạo mới khuyến mãi thành công.`, {
              type: "success",
              duration: 1500,
            });

            // set to init
            globalPromotionState.setPromotion({
              ...result.value.promotionInfo,
            });
            router.replace("/promotion/details");
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
    } else {
      Alert.alert("Oops!", "Vui lòng hoàn thành thông tin một cách hợp lệ");
    }
  };
  //   console.log(
  //     "promotion.applyType",
  //     promotion.applyType,
  //     promotion.applyType == PromotionApplyType.RateApply
  //   );
  return (
    <PageLayoutWrapper>
      <View className="p-4 bg-gray">
        <View className="flex flex-row gap-4">
          <View className="flex-1 flex flex-col gap-3">
            <View className="mb-2">
              <Text className="font-bold">Tiêu đề *</Text>
              <TextInput
                className="border border-gray-300 text-[16px] mt-1 p-2 rounded"
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
                className="border border-gray-300 text-[16px] mt-1 p-2 rounded h-16"
                placeholder="Nhập mô tả chương trình khuyến mãi"
                value={promotion.description}
                onChangeText={(text) => handleChange("description", text)}
                multiline
                placeholderTextColor="#888"
              />
            </View>

            {/* </View> */}

            {/* <View className="flex-1 flex flex-col gap-4"> */}
            <View className="flex mt-2">
              <View className="flex-1">
                <Text className="font-bold">Thời gian bắt đầu *</Text>
                <View className="flex-row px-1 relative mt-2 gap-x-2">
                  <TouchableRipple
                    onPress={() => {
                      setFromDatePickerVisibility(true);
                      // console.log(
                      //   "promotion.startDate: ",
                      //   promotion.startDate,
                      //   dayjs(promotion.startDate).add(7, "hour").toDate()
                      // );
                    }}
                    className="flex-1 border-2 border-gray-300 p-1 rounded-md"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-black mx-2 text-[16px]">
                        {dayjs(promotion.startDate)
                          .local()
                          .format("DD/MM/YYYY")}
                      </Text>

                      <Ionicons
                        name="create-outline"
                        size={21}
                        color="gray-600"
                      />

                      <DateTimePickerModal
                        isVisible={isFromDatePickerVisible}
                        mode="date"
                        locale="vi-VN"
                        timeZoneName="GMT"
                        confirmTextIOS="Hoàn tất"
                        cancelTextIOS="Hủy"
                        date={dayjs(promotion.startDate)
                          .add(7, "hour")
                          .toDate()}
                        onConfirm={(date: Date) => {
                          // date = dayjs(date).add(7, "hour").toDate();
                          const updatedDate = dayjs(date)
                            .subtract(7, "hour")
                            .toDate();

                          // console.log(
                          //   "StartTime : Date update updatedDate: ",
                          //   date.toISOString(),
                          //   dayjs(date).day(),
                          //   updatedDate.toISOString()
                          // );
                          setPromotion({
                            ...promotion,
                            startDate: updatedDate.toISOString(),
                            endDate:
                              updatedDate > new Date(promotion.endDate)
                                ? updatedDate.toISOString()
                                : promotion.endDate,
                          });
                          setFromDatePickerVisibility(false);
                        }}
                        onCancel={() => setFromDatePickerVisibility(false)}
                      />
                    </View>
                  </TouchableRipple>

                  <TouchableRipple
                    onPress={() => {
                      setFromTimePickerVisibility(true);
                      // console.log(
                      //   "promotion.startDate: ",
                      //   promotion.startDate,
                      //   dayjs(promotion.startDate).add(7, "hour").toDate()
                      // );
                    }}
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

                      <DateTimePickerModal
                        isVisible={isFromTimePickerVisible}
                        mode="time"
                        locale="vi-VN"
                        timeZoneName="GMT"
                        confirmTextIOS="Hoàn tất"
                        cancelTextIOS="Hủy"
                        date={dayjs(promotion.startDate)
                          .add(7, "hour")
                          .toDate()}
                        onConfirm={(date: Date) => {
                          // Update only the time part and keep date part unchanged in UTC+7
                          const updatedTime = dayjs(promotion.startDate)
                            .set("hour", dayjs(date).hour())
                            .set("minute", dayjs(date).minute())
                            .subtract(7, "hour")
                            .toDate();

                          // console.log(
                          //   "StartTime : Time update updatedDate: ",
                          //   date.toISOString(),
                          //   updatedTime.toISOString()
                          // );
                          setPromotion({
                            ...promotion,
                            startDate: updatedTime.toISOString(),
                            endDate:
                              updatedTime > new Date(promotion.endDate)
                                ? updatedTime.toISOString()
                                : promotion.endDate,
                          });
                          setFromTimePickerVisibility(false);
                        }}
                        onCancel={() => setFromTimePickerVisibility(false)}
                      />
                    </View>
                  </TouchableRipple>
                </View>
              </View>

              <View className="flex-1 mt-2">
                <Text className="font-bold">Thời gian kết thúc *</Text>
                <View className="flex-row px-1 relative mt-2 gap-x-2">
                  <TouchableRipple
                    onPress={() => {
                      setToDatePickerVisibility(true);
                      //   console.log(
                      //     "promotion.endDate: ",
                      //     promotion.endDate,
                      //     dayjs(promotion.endDate).add(7, "hour").toDate()
                      //   );
                    }}
                    className="flex-1 border-2 border-gray-300 p-1 rounded-md"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-black mx-2 text-[16px]">
                        {dayjs(promotion.endDate).local().format("DD/MM/YYYY")}
                      </Text>

                      <Ionicons
                        name="create-outline"
                        size={21}
                        color="gray-600"
                      />

                      <DateTimePickerModal
                        isVisible={isToDatePickerVisible}
                        mode="date"
                        locale="vi-VN"
                        timeZoneName="GMT"
                        confirmTextIOS="Hoàn tất"
                        cancelTextIOS="Hủy"
                        date={dayjs(promotion.endDate).add(7, "hour").toDate()}
                        onConfirm={(date: Date) => {
                          // date = dayjs(date).add(7, "hour").toDate();
                          const updatedDate = dayjs(date)
                            .subtract(7, "hour")
                            .toDate();

                          //   console.log(
                          //     "StartTime : Date update updatedDate: ",
                          //     date.toISOString(),
                          //     dayjs(date).day(),
                          //     updatedDate.toISOString()
                          //   );
                          setPromotion({
                            ...promotion,
                            endDate: updatedDate.toISOString(),
                            startDate:
                              updatedDate < new Date(promotion.startDate)
                                ? updatedDate.toISOString()
                                : promotion.startDate,
                          });
                          setToDatePickerVisibility(false);
                        }}
                        onCancel={() => setToDatePickerVisibility(false)}
                      />
                    </View>
                  </TouchableRipple>

                  <TouchableRipple
                    onPress={() => {
                      setToTimePickerVisibility(true);
                      //   console.log(
                      //     "promotion.endDate: ",
                      //     promotion.endDate,
                      //     dayjs(promotion.endDate).add(7, "hour").toDate()
                      //   );
                    }}
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

                      <DateTimePickerModal
                        isVisible={isToTimePickerVisible}
                        mode="time"
                        locale="vi-VN"
                        timeZoneName="GMT"
                        confirmTextIOS="Hoàn tất"
                        cancelTextIOS="Hủy"
                        date={dayjs(promotion.endDate).add(7, "hour").toDate()}
                        onConfirm={(date: Date) => {
                          // Update only the time part and keep date part unchanged in UTC+7
                          const updatedTime = dayjs(promotion.endDate)
                            .set("hour", dayjs(date).hour())
                            .set("minute", dayjs(date).minute())
                            .subtract(7, "hour")
                            .toDate();

                          //   console.log(
                          //     "StartTime : Time update updatedDate: ",
                          //     date.toISOString(),
                          //     updatedTime.toISOString()
                          //   );
                          setPromotion({
                            ...promotion,
                            endDate: updatedTime.toISOString(),
                            startDate:
                              updatedTime < new Date(promotion.startDate)
                                ? updatedTime.toISOString()
                                : promotion.startDate,
                          });
                          setToTimePickerVisibility(false);
                        }}
                        onCancel={() => setToTimePickerVisibility(false)}
                      />
                    </View>
                  </TouchableRipple>
                </View>
              </View>
            </View>

            {errors.startDate && (
              <Text className="text-red-500 text-xs">{errors.startDate}</Text>
            )}

            <View className="mb-2">
              <Text className="font-bold mb-1">Loại áp dụng *</Text>
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
                <Text className="font-bold">Tỷ lệ giảm giá (%) *</Text>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 text-[16px] mt-1 p-2 rounded"
                    placeholder="Nhập tỷ lệ giảm giá"
                    value={utilService.formatPrice(promotion.amountRate)}
                    onChangeText={(text) => handleChange("amountRate", text)}
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                  />
                  {/* <Text className="absolute right-2 top-4 text-[12px] italic">
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
                <Text className="font-bold">Giá trị giảm giá *</Text>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 text-[16px] mt-1 p-2 rounded"
                    placeholder="Nhập giá trị giảm giá"
                    value={utilService.formatPrice(promotion.amountValue)}
                    onChangeText={(text) => handleChange("amountValue", text)}
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-2 top-4 text-[12px] italic">
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
              <Text className="font-bold">Giá trị đơn hàng tối thiểu *</Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 text-[16px] mt-1 p-2 rounded"
                  placeholder="Nhập giá trị đơn hàng tối thiểu"
                  value={utilService.formatPrice(promotion.minOrdervalue)}
                  onChangeText={(text) => handleChange("minOrdervalue", text)}
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <Text className="absolute right-2 top-4 text-[12px] italic">
                  đồng
                </Text>
              </View>

              {errors.minOrdervalue && (
                <Text className="text-red-500 text-xs">
                  {errors.minOrdervalue}
                </Text>
              )}
            </View>
            {promotion.applyType != PromotionApplyType.AmountApply && (
              <View className="mb-2">
                <Text className="font-bold">
                  Giá trị khuyến mãi tối đa{" "}
                  {promotion.applyType != PromotionApplyType.AmountApply && "*"}
                </Text>
                <View className="relative">
                  <TextInput
                    className={`border border-gray-300 text-[16px] mt-1 p-2 rounded ${
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
                  <Text className="absolute right-2 top-4 text-[12px] italic">
                    đồng
                  </Text>
                </View>
                {errors.minOrdervalue && (
                  <Text className="text-red-500 text-xs">
                    {errors.minOrdervalue}
                  </Text>
                )}
              </View>
            )}

            <View className="mb-2">
              <Text className="font-bold">Giới hạn lượt sử dụng *</Text>
              <TextInput
                className="border border-gray-300 text-[16px] mt-1 p-2 rounded"
                placeholder="Nhập số lần sử dụng tối đa"
                value={promotion.usageLimit.toString()}
                onChangeText={(text) => handleChange("usageLimit", text)}
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
              {errors.usageLimit && (
                <Text className="text-red-500 text-xs">
                  {errors.usageLimit}
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

            <View className="flex flex-row items-center gap-y-2">
              <Text className="font-semibold mr-3">Trạng thái khả dụng</Text>
              <Switch
                color="#e95137"
                value={promotion.status == 1}
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
