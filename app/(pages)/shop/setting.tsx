import { View, Text, TouchableOpacity, Dimensions, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Avatar, Switch } from "react-native-paper";
import sessionService from "@/services/session-service";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import {
  OperatingSlotModel,
  ShopProfileGetModel,
} from "@/types/models/ShopProfileModel";
import { Slot, useFocusEffect } from "expo-router";
import { BottomSheet } from "@rneui/themed";
import CustomButton from "@/components/custom/CustomButton";
import Modal from "react-native-modal";
import CustomModal from "@/components/common/CustomModal";
import FormField from "@/components/custom/FormFieldCustom";
import FormFieldCustom from "@/components/custom/FormFieldCustom";
import AnyTimeRangeSelect from "@/components/common/AnyTimeRangeSelect";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import { useToast } from "react-native-toast-notifications";
import AutoConfirmTimeRangeSelect, {
  autoConfirmTimeFormat,
} from "@/components/common/AutoConfirmTimeRangeSelect";
function formatTimeRanges(timeRanges: string[]): string {
  const length = timeRanges.length;

  if (length <= 3) {
    // Join all elements with " | " for lists with 3 or fewer elements
    return timeRanges.join(" | ");
  } else if (length === 4) {
    // Insert a newline between the first two and last two elements for a list with 4 elements
    return `${timeRanges.slice(0, 2).join(" | ")}\n${timeRanges
      .slice(2)
      .join(" | ")}`;
  } else {
    // For lists with more than 4 elements, group by three elements per line
    let formattedString = "";
    for (let i = 0; i < length; i += 3) {
      formattedString += timeRanges.slice(i, i + 3).join(" | ");
      if (i + 3 < length) {
        formattedString += "\n";
      }
    }
    return formattedString;
  }
}
const detailBottomHeight = Dimensions.get("window").height - 100;

const initOperatingSlot = {
  id: 0,
  title: "",
  startTime: 30,
  endTime: 2330,
  timeSlot: "",
  isActive: true,
  isReceivingOrderPaused: false,
};
const Setting = () => {
  // (async () => {
  //   console.log(await sessionService.getAuthToken());
  // })();
  const toast = useToast();
  const [isSlotModalOpening, setIsSlotModalOpening] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [autoConfirmSettingMode, setAutoConfirmSettingMode] = React.useState(0);
  const [operatingSlot, setOperatingSlot] =
    React.useState<OperatingSlotModel>(initOperatingSlot);
  const [autoConfirmMinMax, setAutoConfirmMinMax] = React.useState<{
    maxOrderHoursInAdvance: number;
    minOrderHoursInAdvance: number;
  }>({ maxOrderHoursInAdvance: 6, minOrderHoursInAdvance: 1 });

  const [
    isOperatingSlotSettingBottomSheetVisible,
    setIsOperatingSlotSettingBottomSheetVisible,
  ] = useState(false);
  const onSwitchStatus = () => () => {};
  const onToggleIsOvernight = () => {};
  const onToggleIsAutoconfirm = () => {};

  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_PROFILE_FULL_INFO,
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    []
  );
  const [cache, setCache] = useState<ShopProfileGetModel>({
    status: 2,
    isAcceptingOrderNextDay: false,
    isReceivingOrderPaused: false,
    isAutoOrderConfirmation: false,
    operatingSlots: [] as OperatingSlotModel[],
  } as ShopProfileGetModel);

  useFocusEffect(
    React.useCallback(() => {
      shopProfile.refetch();
    }, [])
  );
  useEffect(() => {
    if (!shopProfile.isFetching && shopProfile.isSuccess)
      setCache({ ...(shopProfile.data?.value || cache) });
  }, [shopProfile.data?.value]);

  const onChangeShopStatusRequest = async (
    request: {
      status: number;
      isReceivingOrderPaused: boolean;
      isConfirm: boolean;
    },
    onSuccess: () => void
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/shop-owner/active-inactive`,
        request
      );
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        onSuccess();
      } else if (isWarning) {
        if (request.isConfirm) return;
        const warningInfo = value as WarningMessageValue;
        Alert.alert("Xác nhận", warningInfo.message, [
          {
            text: "Đồng ý",
            onPress: async () => {
              onChangeShopStatusRequest(
                { ...request, isConfirm: true },
                onSuccess
              );
            },
          },
          {
            text: "Hủy",
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const onChangeShopStatusSubmit = async (
    status: number,
    isReceivingOrderPaused: boolean,
    onSuccess: () => void
  ) => {
    onChangeShopStatusRequest(
      {
        status,
        isReceivingOrderPaused,
        isConfirm: false,
      },
      onSuccess
    );
  };
  const onChangeIsAcceptingOrderNextDayRequest = async (
    request: {
      isAcceptingOrderNextDay: boolean;
      isConfirm: boolean;
    },
    onSuccess: () => void
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/is-accept-order-next-day`,
        request
      );
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        onSuccess();
      } else if (isWarning) {
        if (request.isConfirm) return;
        const warningInfo = value as WarningMessageValue;
        Alert.alert("Xác nhận", warningInfo.message, [
          {
            text: "Đồng ý",
            onPress: async () => {
              onChangeIsAcceptingOrderNextDayRequest(
                { ...request, isConfirm: true },
                onSuccess
              );
            },
          },
          {
            text: "Hủy",
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const onChangeIsAcceptingOrderNextDaySubmit = async (
    isAcceptingOrderNextDay: boolean,
    onSuccess: () => void
  ) => {
    onChangeIsAcceptingOrderNextDayRequest(
      {
        isAcceptingOrderNextDay,
        isConfirm: false,
      },
      onSuccess
    );
  };
  const onChangeIsAutoOrderConfirmationRequest = async (
    request: {
      isAutoOrderConfirmation: boolean;
      maxOrderHoursInAdvance: number;
      minOrderHoursInAdvance: number;
      isConfirm: boolean;
    },
    onSuccess: () => void,
    statusOnly: boolean = false
  ) => {
    request = {
      ...request,
      maxOrderHoursInAdvance: Math.round(request.maxOrderHoursInAdvance),
      minOrderHoursInAdvance: Math.round(request.minOrderHoursInAdvance),
    };
    try {
      setIsSubmitting(true);
      const response = statusOnly
        ? await apiClient.put(`shop-owner/is-auto-confirm`, request)
        : await apiClient.put(`shop-owner/is-auto-confirm-condition`, request);
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        onSuccess();
      } else if (isWarning) {
        if (request.isConfirm) return;
        const warningInfo = value as WarningMessageValue;
        Alert.alert("Xác nhận", warningInfo.message, [
          {
            text: "Đồng ý",
            onPress: async () => {
              onChangeIsAutoOrderConfirmationRequest(
                { ...request, isConfirm: true },
                onSuccess
              );
            },
          },
          {
            text: "Hủy",
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const onChangeIsAutoOrderConfirmationSubmit = async (
    isAutoOrderConfirmation: boolean,
    maxOrderHoursInAdvance: number,
    minOrderHoursInAdvance: number,
    onSuccess: () => void,
    isStatusOnly: boolean = false
  ) => {
    onChangeIsAutoOrderConfirmationRequest(
      {
        isAutoOrderConfirmation,
        maxOrderHoursInAdvance,
        minOrderHoursInAdvance,
        isConfirm: false,
      },
      onSuccess,
      isStatusOnly
    );
  };
  const onOperatingSlotRequest = async (
    request: {
      operatingSlot: OperatingSlotModel;
      isConfirm: boolean;
    },
    onSuccess: () => void = () => {}
  ) => {
    request.operatingSlot = {
      ...request.operatingSlot,
      title: request.operatingSlot.title.trim(),
    };
    try {
      setIsSubmitting(true);
      const response =
        request.operatingSlot.id == 0
          ? await apiClient.post(
              `shop-owner/operating-slot`,
              request.operatingSlot
            )
          : await apiClient.put(
              `shop-owner/operating-slot/${request.operatingSlot.id}`,
              { ...request.operatingSlot, isConfirm: request.isConfirm }
            );
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        setIsSlotModalOpening(false);
        shopProfile.refetch();
        console.log(
          "shopProfile.data?.value.operatingSlots: ",
          shopProfile.data?.value.operatingSlots
        );
        onSuccess();
      } else if (isWarning) {
        if (request.isConfirm) return;
        const warningInfo = value as WarningMessageValue;
        Alert.alert("Xác nhận", warningInfo.message, [
          {
            text: "Đồng ý",
            onPress: async () => {
              onOperatingSlotRequest({ ...request, isConfirm: true });
            },
          },
          {
            text: "Hủy",
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const onOpeartingSlotSubmit = async (
    operatingSlot: OperatingSlotModel,
    onSuccess: () => void = () => {}
  ) => {
    if (operatingSlot.title.trim().length == 0) {
      Alert.alert("Oops!", "Vui lòng nhập mô tả!");
      return;
    }
    onOperatingSlotRequest(
      {
        operatingSlot,
        isConfirm: false,
      },
      onSuccess
    );
  };

  const onOperatingSlotDeleteRequest = async (request: {
    operatingSlot: OperatingSlotModel;
    isConfirm: boolean;
  }) => {
    request.operatingSlot = {
      ...request.operatingSlot,
      title: request.operatingSlot.title.trim(),
    };
    try {
      setIsSubmitting(true);
      const response = await apiClient.delete(
        `shop-owner/operating-slot/${request.operatingSlot.id}`,
        {
          data: {
            id: request.operatingSlot.id,
            isConfirm: request.isConfirm,
          },
        }
      );
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        setIsSlotModalOpening(false);
        shopProfile.refetch();
        Alert.alert(
          "Hoàn tất",
          `Đã xóa khoảng hoạt động ${request.operatingSlot.title} : ${request.operatingSlot.timeSlot}`
        );
      } else if (isWarning) {
        if (request.isConfirm) return;
        const warningInfo = value as WarningMessageValue;
        Alert.alert("Xác nhận", warningInfo.message, [
          {
            text: "Đồng ý",
            onPress: async () => {
              onOperatingSlotRequest({ ...request, isConfirm: true });
            },
          },
          {
            text: "Hủy",
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const onOperatingSlotDelete = async (operatingSlot: OperatingSlotModel) => {
    Alert.alert(
      "Xác nhận",
      `Xác nhận xóa khoảng hoạt động "${operatingSlot.title} : ${operatingSlot.timeSlot}"`,
      [
        {
          text: "Xác nhận",
          onPress: async () => {
            onOperatingSlotDeleteRequest({
              operatingSlot,
              isConfirm: false,
            });
          },
        },
        {
          text: "Hủy",
        },
      ]
    );
  };

  const getShopStatusDescription = (
    status: number,
    isReceivingOrderPaused: boolean
  ) => {
    if (status === 0) return "";
    if (status == 1) return "Chưa được phê duyệt";
    if (status == 3) return "Tạm đóng cửa hàng";
    if (isReceivingOrderPaused) return "Tạm ngưng nhận đơn";
    if (status == 2) return "Đang mở bán";
  };
  const operatingSlotSetting = (
    <View
      className={`p-4 bg-white rounded-t-lg bottom-0 h-max`}
      style={{
        maxHeight: detailBottomHeight,
        height: cache.operatingSlots?.length
          ? Math.max((cache.operatingSlots?.length || 0) * 100 + 100, 240)
          : 240,
      }}
    >
      <CustomModal
        isOpen={isSlotModalOpening}
        setIsOpen={setIsSlotModalOpening}
        title={
          operatingSlot.id == 0
            ? "Thêm mới khoảng hoạt động"
            : "Cập nhật thời gian hoạt động"
        }
        titleStyleClasses="text-[14px] font-semibold"
      >
        <View className="">
          <FormFieldCustom
            isRequired={true}
            title={"Mô tả"}
            value={operatingSlot.title}
            placeholder={"Nhập mô tả khoảng hoạt động..."}
            handleChangeText={(e) => {
              setOperatingSlot({ ...operatingSlot, title: e });
            }}
            otherInputStyleClasses={`border-gray-300 h-12 mt-[-4px] pb-1 `}
            otherTextInputStyleClasses="text-[14px]"
            otherStyleClasses="mt-1"
          />
          <View className="mt-2">
            <FormFieldCustom
              isRequired={true}
              labelOnly={true}
              title={"Chọn khoảng thời gian"}
              value={""}
              placeholder={""}
              handleChangeText={(e) => {}}
              otherInputStyleClasses="border-gray-300 h-12 mt-[-4px] pb-1"
              otherTextInputStyleClasses="text-[14px]"
              otherStyleClasses="mt-1"
            />
            <AnyTimeRangeSelect
              header={<Text></Text>}
              startTime={operatingSlot.startTime}
              endTime={operatingSlot.endTime}
              setStartTime={(time) => {
                setOperatingSlot({ ...operatingSlot, startTime: time });
              }}
              setEndTime={(time) => {
                setOperatingSlot({ ...operatingSlot, endTime: time });
              }}
            />
          </View>
          <CustomButton
            title={operatingSlot.id == 0 ? "Thêm mới" : "Cập nhật"}
            containerStyleClasses="mt-5 bg-secondary border-2 border-secondary-100  h-[40px]"
            textStyleClasses="text-white text-sm "
            // iconLeft={
            //   <View className="mr-1">
            //     <Ionicons name="add-circle-outline" size={16} color="#FF9001" />
            //   </View>
            // }
            handlePress={() => {
              onOpeartingSlotSubmit(operatingSlot, () => {
                operatingSlot.id == 0
                  ? Alert.alert(
                      "Hoàn tất",
                      `Đã thêm khoảng hoạt động ${operatingSlot.title.trim()} : ${
                        operatingSlot.timeSlot
                      }`
                    )
                  : Alert.alert(
                      "Hoàn tất",
                      `Đã cập nhật khoảng hoạt động ${operatingSlot.title.trim()} : ${
                        operatingSlot.timeSlot
                      }`
                    );
              });
            }}
            isLoading={isSubmitting}
          />
        </View>
      </CustomModal>

      <TouchableOpacity
        className="items-center"
        onPress={() => setIsOperatingSlotSettingBottomSheetVisible(false)}
      >
        <Ionicons name="chevron-down-outline" size={24} color="gray" />
      </TouchableOpacity>
      <View className="flex-1 mt-3">
        <Text className="text-md text-gray-800 text-center mb-4">
          Các khoảng thời gian hoạt động trong ngày
        </Text>
        {!cache.operatingSlots.length && (
          <Text className="text-[11px] italic text-gray-700 text-center ">
            Chưa có bất kì khoảng hoạt động nào
          </Text>
        )}
        <View className="justify-stretch">
          {cache.operatingSlots.map((slot, index) => (
            <View
              key={slot.id}
              className="w-full border-[1px] border-gray-200 px-2 py-1 "
            >
              <View
                className=" me-2 px-2.5 py-1 rounded flex-row items-center justify-between"
                style={{
                  backgroundColor:
                    slot.isActive && !slot.isReceivingOrderPaused
                      ? "#99f6e4"
                      : !slot.isActive
                      ? "#e5e7eb"
                      : "#fef08a",
                }}
              >
                <Text className={`text-[12px] font-medium flex-1`}>
                  {slot.isActive && !slot.isReceivingOrderPaused
                    ? "Đang hoạt động"
                    : !slot.isActive
                    ? "Đã tắt hoạt động"
                    : "Tạm ngưng nhận đơn hôm nay"}
                </Text>
                <View className="scale-50 h-5 items-center justify-center">
                  <Switch
                    color="#e95137"
                    value={slot.isActive && !slot.isReceivingOrderPaused}
                    onValueChange={(value) => {
                      if (value) {
                        Alert.alert(
                          `Xác nhận`,
                          `Bạn muốn ${
                            slot.isReceivingOrderPaused
                              ? "mở nhận đơn trở lại cho khung giờ " +
                                slot.timeSlot +
                                " (" +
                                slot.title +
                                ")"
                              : "mở hoạt động trở lại cho khung giờ " +
                                slot.timeSlot +
                                " (" +
                                slot.title +
                                ")"
                          }?`,
                          [
                            {
                              text: "Đồng ý",
                              onPress: async () => {
                                onOpeartingSlotSubmit(
                                  {
                                    ...slot,
                                    isActive: true,
                                    isReceivingOrderPaused: false,
                                  },
                                  () => {
                                    shopProfile.refetch();
                                    toast.show(
                                      `Đã ${
                                        slot.isReceivingOrderPaused
                                          ? "mở nhận đơn trở lại cho khung giờ " +
                                            slot.timeSlot +
                                            " (" +
                                            slot.title +
                                            ")"
                                          : "mở hoạt động trở lại cho khung giờ " +
                                            slot.timeSlot +
                                            " (" +
                                            slot.title +
                                            ")"
                                      }`,
                                      {
                                        type: "success",
                                        duration: 2000,
                                      }
                                    );
                                  }
                                );
                              },
                            },
                            {
                              text: "Hủy",
                            },
                          ]
                        );
                      } else {
                        Alert.alert(
                          `Xác nhận`,
                          `Bạn muốn tạm ngưng nhận đơn hôm nay hay tắt hoạt động cho khung giờ ${
                            slot.timeSlot + " (" + slot.title + ")"
                          }?`,
                          [
                            {
                              text: "Ngưng nhận đơn hôm nay",
                              onPress: async () => {
                                onOpeartingSlotSubmit(
                                  {
                                    ...slot,
                                    isActive: true,
                                    isReceivingOrderPaused: true,
                                  },
                                  () => {
                                    shopProfile.refetch();
                                    toast.show(
                                      `Đã ngưng nhận đơn hôm nay cho khung giờ ${
                                        slot.timeSlot + " (" + slot.title + ")"
                                      }.`,
                                      {
                                        type: "success",
                                        duration: 2000,
                                      }
                                    );
                                  }
                                );
                              },
                            },
                            {
                              text: "Tạm dừng hoạt động",
                              onPress: async () => {
                                onOpeartingSlotSubmit(
                                  {
                                    ...slot,
                                    isActive: false,
                                    isReceivingOrderPaused: false,
                                  },
                                  () => {
                                    shopProfile.refetch();
                                    toast.show(
                                      `Đã tắt hoạt động cho khung giờ ${
                                        slot.timeSlot + " (" + slot.title + ")"
                                      }.`,
                                      {
                                        type: "success",
                                        duration: 2000,
                                      }
                                    );
                                  }
                                );
                              },
                            },
                            {
                              text: "Hủy",
                            },
                          ]
                        );
                      }
                    }}
                    disabled={shopProfile.isRefetching || isSubmitting}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setOperatingSlot({ ...slot });
                    setIsSlotModalOpening(true);
                  }}
                >
                  <Ionicons name="create-outline" size={24} color="#227B94" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="ml-1"
                  onPress={() => {
                    onOperatingSlotDelete({ ...slot });
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF9001" />
                </TouchableOpacity>
              </View>
              <View className="border-gray-200 rounded flex-row items-center justify-center">
                <Text className="text-[16px] italic text-gray-800 text-center flex-1 font-semibold mt-2">
                  {slot.title} :{" "}
                  <Text className="font-semibold">{slot.timeSlot}</Text>
                </Text>
                <View className="mx-2 flex-row items-center"></View>
              </View>

              {/* {index !=
            cache.operatingSlots.length - 1 && (
            <View className="h-[1px] bg-gray-200 mt-2 mb-2" />
          )} */}
            </View>
          ))}
        </View>
      </View>
      <CustomButton
        title="Thêm mới"
        containerStyleClasses="mt-5 bg-white border-2 border-secondary-100  h-[40px]"
        textStyleClasses="text-white text-sm text-secondary-100"
        iconLeft={
          <View className="mr-1">
            <Ionicons name="add-circle-outline" size={16} color="#FF9001" />
          </View>
        }
        handlePress={() => {
          setOperatingSlot({ ...initOperatingSlot });
          setIsSlotModalOpening(true);
        }}
      />
    </View>
  );
  return (
    <PageLayoutWrapper>
      <View className="p-4 gap-y-8">
        <View className="">
          <TouchableOpacity className="flex-row justify-between items-center gap-x-2 pb-4 px-1">
            <View className="flex-row justify-start items-center">
              <View className="border-[1px] rounded-full border-[#fff1f2] mr-2">
                <Avatar.Image
                  size={48}
                  source={{
                    uri: cache.logoUrl || "string",
                  }}
                />
              </View>

              <View className="gap-y-0">
                <Text className="text-lg italic text-gray text-primary font-medium mb-[-4px]">
                  {cache.name}
                </Text>

                <Text className="text-[11px] italic text-gray text-primary font-medium ">
                  {getShopStatusDescription(
                    cache.status ? cache.status : 0,
                    cache.isReceivingOrderPaused || false
                  )}
                </Text>
              </View>
            </View>

            <View className="scale-100">
              <Switch
                color="#e95137"
                value={
                  cache.status == 2 && cache.isReceivingOrderPaused == false
                }
                onValueChange={(value) => {
                  if (value) {
                    Alert.alert(
                      `Xác nhận`,
                      `Bạn muốn ${
                        cache.isReceivingOrderPaused
                          ? "mở nhận đơn trở lại"
                          : "mở cửa hàng trở lại"
                      }?`,
                      [
                        {
                          text: "Đồng ý",
                          onPress: async () => {
                            onChangeShopStatusSubmit(2, false, () => {
                              shopProfile.refetch();
                              toast.show(
                                `Cửa hàng đã ${
                                  cache.isReceivingOrderPaused
                                    ? "mở nhận đơn trở lại."
                                    : "mở hoạt động trở lại."
                                }`,
                                {
                                  type: "success",
                                  duration: 2000,
                                }
                              );
                            });
                          },
                        },
                        {
                          text: "Hủy",
                        },
                      ]
                    );
                  } else {
                    Alert.alert(
                      `Xác nhận`,
                      `Bạn muốn tạm ngưng nhận đơn hôm nay hay tạm dừng hoạt động của cửa hàng?`,
                      [
                        {
                          text: "Tạm ngưng nhận đơn",
                          onPress: async () => {
                            onChangeShopStatusSubmit(2, true, () => {
                              shopProfile.refetch();
                              toast.show(
                                `Cửa hàng của bạn đã tạm ngưng nhận đơn hôm nay.`,
                                {
                                  type: "info",
                                  duration: 2000,
                                }
                              );
                            });
                          },
                        },
                        {
                          text: "Tạm dừng hoạt động",
                          onPress: async () => {
                            onChangeShopStatusSubmit(3, false, () => {
                              shopProfile.refetch();
                              toast.show(
                                `Cửa hàng của bạn đã chuyển sang trạng thái tạm dừng hoạt động`,
                                {
                                  type: "info",
                                  duration: 2000,
                                }
                              );
                            });
                          },
                        },
                        {
                          text: "Hủy",
                        },
                      ]
                    );
                  }
                }}
                disabled={
                  shopProfile.isRefetching ||
                  (cache.status != 2 && cache.status != 3) ||
                  isSubmitting
                }
              />
            </View>
          </TouchableOpacity>
          <View className="border-b-2 border-gray-300"></View>
        </View>

        <View className="">
          <Text className="font-semibold text-gray-600">
            THỜI GIAN HOẠT ĐỘNG
          </Text>
          <View className="text-gray-700">
            <TouchableOpacity
              onPress={() => {
                shopProfile.refetch();
                setIsOperatingSlotSettingBottomSheetVisible(true);
              }}
              className="flex-row p-1 justify-between items-center mt-1"
            >
              <View className="flex-row gap-x-2">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                {/* {shopProfile.isLoading && (
                  <ActivityIndicator animating={true} color="#FCF450" />
                )} */}

                <Text className={`font-semibold text-md text-gray-600`}>
                  {formatTimeRanges(
                    (cache.operatingSlots || []).map((slot) => slot.timeSlot)
                  )}
                </Text>
              </View>
              <Ionicons size={20} name="chevron-forward-outline" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="">
          <Text className="font-semibold text-gray-600">ĐẶT HÀNG QUA ĐÊM</Text>
          <View className="text-gray-700">
            <TouchableOpacity
              onPress={() => {}}
              className="flex-row p-1 justify-between items-center mt-1"
            >
              <View className="flex-row gap-x-2">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                <Text className={`font-medium text-md text-gray-600`}>
                  Cho phép đặt hàng cho ngày hôm sau
                </Text>
              </View>

              <View className="scale-75">
                <Switch
                  color="#e95137"
                  value={
                    cache.status == 2 &&
                    cache.isReceivingOrderPaused == false &&
                    cache.isAcceptingOrderNextDay
                  }
                  onValueChange={(value) => {
                    Alert.alert(
                      `Xác nhận`,
                      `${
                        value ? "Bật" : "Tắt"
                      } cho phép đặt hàng cho ngày hôm sau?`,
                      [
                        {
                          text: "Đồng ý",
                          onPress: async () => {
                            onChangeIsAcceptingOrderNextDaySubmit(value, () => {
                              shopProfile.refetch();
                              toast.show(
                                `Đã ${
                                  value ? "bật" : "tắt"
                                } cho phép đặt hàng cho ngày hôm sau.`,
                                {
                                  type: value ? "success" : "info",
                                  duration: 1500,
                                }
                              );
                            });
                          },
                        },
                        {
                          text: "Hủy",
                        },
                      ]
                    );
                  }}
                  disabled={
                    shopProfile.isRefetching ||
                    cache.status == 3 ||
                    cache.isReceivingOrderPaused == true ||
                    isSubmitting
                  }
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="">
          <CustomModal
            isOpen={autoConfirmSettingMode != 0}
            setIsOpen={(value) => {}}
            close={() => setAutoConfirmSettingMode(0)}
            title={
              autoConfirmSettingMode == 1
                ? "Bật tính năng tự động xác nhận đơn"
                : "Tự động xác nhận đơn"
            }
            titleStyleClasses="text-[14px] font-semibold"
          >
            <View className="">
              <View className="mt-2">
                <AutoConfirmTimeRangeSelect
                  header={<Text></Text>}
                  endTime={Math.round(autoConfirmMinMax.maxOrderHoursInAdvance)}
                  startTime={Math.round(
                    autoConfirmMinMax.minOrderHoursInAdvance
                  )}
                  setEndTime={(time) => {
                    setAutoConfirmMinMax({
                      ...autoConfirmMinMax,
                      maxOrderHoursInAdvance: time,
                    });
                  }}
                  setStartTime={(time) => {
                    setAutoConfirmMinMax({
                      ...autoConfirmMinMax,
                      minOrderHoursInAdvance: time,
                    });
                  }}
                />
                <Text
                  className={`italic text-[11px] text-gray-600 mt-2 text-center`}
                >
                  Lưu ý *: tính năng này chỉ hoạt động trong thời gian hoạt động
                  của cửa hàng
                </Text>
              </View>
              <CustomButton
                title={autoConfirmSettingMode == 1 ? "Xác nhận" : "Cập nhật"}
                containerStyleClasses="mt-5 bg-secondary border-2 border-secondary-100  h-[40px]"
                textStyleClasses="text-white text-sm "
                // iconLeft={
                //   <View className="mr-1">
                //     <Ionicons name="add-circle-outline" size={16} color="#FF9001" />
                //   </View>
                // }
                handlePress={() => {
                  onChangeIsAutoOrderConfirmationRequest(
                    {
                      isAutoOrderConfirmation: true,
                      ...autoConfirmMinMax,
                      isConfirm: false,
                    },
                    () => {
                      setAutoConfirmSettingMode(0);
                      shopProfile.refetch();
                      toast.show(
                        `Đã ${
                          autoConfirmSettingMode == 1
                            ? "bật tính năng tự động xác nhận đơn."
                            : "cập nhật khoảng thời gian tự động xác nhận đơn."
                        }`,
                        {
                          type: "success",
                          duration: 2000,
                        }
                      );
                    }
                  );
                }}
                isLoading={isSubmitting}
              />
            </View>
          </CustomModal>
          <Text className="font-semibold text-gray-600">
            TỰ ĐỘNG XÁC NHẬN ĐƠN HÀNG
          </Text>
          <View className="text-gray-700">
            <TouchableOpacity
              className="flex-row p-1 justify-between items-center mt-1"
              disabled={true}
            >
              <View className="flex-row gap-x-2 flex-1">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                <Text className={`font-medium italic text-md text-gray-600`}>
                  {cache.status == 2 &&
                  cache.isReceivingOrderPaused == false &&
                  cache.isAutoOrderConfirmation
                    ? "Đang bật tự động xác nhận đơn"
                    : "Đã tắt tự động xác nhận đơn"}
                </Text>
              </View>

              <View className="scale-75 ml-2">
                <Switch
                  color="#e95137"
                  value={
                    cache.status == 2 &&
                    cache.isReceivingOrderPaused == false &&
                    cache.isAutoOrderConfirmation
                  }
                  onValueChange={(value) => {
                    if (value) {
                      setAutoConfirmSettingMode(1);
                      setAutoConfirmMinMax({
                        maxOrderHoursInAdvance:
                          cache.maxOrderHoursInAdvance || 6,
                        minOrderHoursInAdvance:
                          cache.minOrderHoursInAdvance || 1,
                      });
                      return;
                    }
                    Alert.alert(
                      `Xác nhận`,
                      `Tắt tính năng tự động xác nhận đơn hàng?`,
                      [
                        {
                          text: "Đồng ý",
                          onPress: async () => {
                            onChangeIsAutoOrderConfirmationRequest(
                              {
                                ...autoConfirmMinMax,
                                isAutoOrderConfirmation: false,
                                isConfirm: false,
                              },
                              () => {
                                setAutoConfirmSettingMode(0);
                                shopProfile.refetch();
                                toast.show(
                                  `Đã tắt tự động tính năng xác nhận đơn hàng.`,
                                  {
                                    type: "info",
                                    duration: 1500,
                                  }
                                );
                              },
                              true
                            );
                          },
                        },
                        {
                          text: "Hủy",
                        },
                      ]
                    );
                  }}
                  disabled={
                    shopProfile.isRefetching ||
                    cache.status == 3 ||
                    cache.isReceivingOrderPaused == true ||
                    isSubmitting
                  }
                />
              </View>
            </TouchableOpacity>

            {cache.isAutoOrderConfirmation && (
              <TouchableOpacity
                className="flex-row p-1 justify-between items-center mt-1"
                onPress={() => {
                  setAutoConfirmSettingMode(2);
                  setAutoConfirmMinMax({
                    maxOrderHoursInAdvance: cache.maxOrderHoursInAdvance || 6,
                    minOrderHoursInAdvance: cache.minOrderHoursInAdvance || 1,
                  });
                }}
              >
                <View className="flex-row gap-x-2 flex-1">
                  {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                  <Text className={`font-medium italic text-md text-gray-600`}>
                    Tự động xác nhận đơn hàng trong khoảng trước{" "}
                    {autoConfirmTimeFormat(cache.maxOrderHoursInAdvance)} đến{" "}
                    {autoConfirmTimeFormat(cache.minOrderHoursInAdvance)} trước
                    khung giao hàng
                  </Text>
                </View>
                <View className="ml-2">
                  <Ionicons size={20} name="chevron-forward-outline" />
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {}}
              disabled
              className="flex-row p-1 justify-between items-center mt-1"
            >
              <View className="flex-row gap-x-2 flex-1">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                <Text
                  className={`font-medium italic text-[12px] text-gray-600`}
                >
                  Lưu ý: tính năng này chỉ hoạt động trong thời gian hoạt động
                  của cửa hàng
                </Text>
              </View>
              <View className="ml-2">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <BottomSheet
        containerStyle={{
          zIndex: 11,
        }}
        modalProps={{}}
        isVisible={isOperatingSlotSettingBottomSheetVisible}
      >
        {operatingSlotSetting}
      </BottomSheet>
    </PageLayoutWrapper>
  );
};

export default Setting;
