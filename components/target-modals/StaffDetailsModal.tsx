import CONSTANTS from "@/constants/data";
import useGlobalStaffState, {
  StaffModalAction,
} from "@/hooks/states/useGlobalStaffState";
import apiClient from "@/services/api-services/api-client";
import utilService from "@/services/util-service";
import {
  emptyShopDeliveryStaff,
  ShopDeliveryStaffModel,
  ShopDeliveryStaffStatus,
} from "@/types/models/StaffInfoModel";
import ValueResponse from "@/types/responses/ValueReponse";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { Switch } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useToast } from "react-native-toast-notifications";
import CustomButton from "../custom/CustomButton";
interface Props {
  containerStyleClasses?: string;

  titleStyleClasses?: string;
}
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const StaffDetailsModal = ({
  containerStyleClasses = "",
  titleStyleClasses = "",
}: Props) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const isAnyRequestSubmit = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const globalStaffState = useGlobalStaffState();
  const [model, setModel] = useState<ShopDeliveryStaffModel>(
    {} as ShopDeliveryStaffModel,
  );

  const getDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<
        ValueResponse<ShopDeliveryStaffModel>
      >(`shop-owner/delivery-staff/${globalStaffState.model.id}`);
      globalStaffState.setModel({ ...response.data.value });
    } catch (error: any) {
      if (error.response && error.response.status == 404) {
        Alert.alert("Oops!", "Không tìm thấy yêu cầu này!");
        globalStaffState.setIsDetailsModalVisible(false);
      } else {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      globalStaffState.isDetailsModalVisible &&
      globalStaffState.isDetailsOrUpdateOrCreateMode != StaffModalAction.Create
    )
      getDetails();
    if (
      globalStaffState.isDetailsOrUpdateOrCreateMode != StaffModalAction.Details
    )
      isAnyRequestSubmit.current = false;
    if (
      globalStaffState.isDetailsOrUpdateOrCreateMode == StaffModalAction.Create
    ) {
      setModel({
        ...emptyShopDeliveryStaff,
        phoneNumber: "",
        email: "",
        password: "123456",
        fullName: "",
        shopDeliveryStaffStatus: 1,
      } as ShopDeliveryStaffModel);
    }
  }, [
    globalStaffState.isDetailsModalVisible,
    globalStaffState.isDetailsOrUpdateOrCreateMode,
  ]);
  useFocusEffect(React.useCallback(() => {}, []));
  const onChangeStaffStatusSubmit = async (
    staff: ShopDeliveryStaffModel,
    onSuccess: () => void,
  ) => {
    setIsSubmitting(true);
    await apiClient
      .put(`shop-owner/delivery-staff/status`, {
        id: staff.id,
        isConfirm: true,
        status: staff.shopDeliveryStaffStatus,
      })
      .then((response) => {
        const { value, isSuccess, isWarning, error } = response.data;
        if (isSuccess) {
          onSuccess();
          globalStaffState.onAfterCompleted();
        }
      })
      .catch((error: any) => {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!",
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const onDelete = async (
    staff: ShopDeliveryStaffModel,
    onSuccess: () => void,
  ) => {
    setIsSubmitting(true);
    await apiClient
      .put(`shop-owner/delivery-staff/delete`, {
        id: staff.id,
        isConfirm: true,
      })
      .then((response) => {
        const { value, isSuccess, isWarning, error } = response.data;
        if (isSuccess) {
          onSuccess();
          globalStaffState.onAfterCompleted();
        }
      })
      .catch((error: any) => {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!",
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const getStaffStatusComponent = (
    staff: ShopDeliveryStaffModel,
    isCreatedMode: boolean = false,
  ) => {
    let label = "";
    let bgColor = "";
    let isSwitchOn = true;
    let onSwitchTouch = () => {};
    switch (staff.shopDeliveryStaffStatus) {
      case ShopDeliveryStaffStatus.On:
        label = "Hoạt động";
        bgColor = "#7dd3fc";
        isSwitchOn = true;
        break;
      case ShopDeliveryStaffStatus.Off:
        label = "Nghỉ phép";
        bgColor = "#fde047";
        isSwitchOn = false;

        break;
      case ShopDeliveryStaffStatus.Inactive:
        label = "Đã khóa";
        bgColor = "#cbd5e1";
        isSwitchOn = false;
        break;
    }
    if (staff.shopDeliveryStaffStatus == 1) {
      onSwitchTouch = () => {
        Alert.alert(
          `Xác nhận`,
          `Bạn muốn chuyển trạng thái của ${staff.fullName} sang nghỉ phép hay khóa tài khoản?`,
          [
            {
              text: "Chuyển sang nghỉ phép",
              onPress: async () => {
                if (isCreatedMode) {
                  setModel({
                    ...staff,
                    shopDeliveryStaffStatus: ShopDeliveryStaffStatus.Off,
                  });
                  return;
                }
                onChangeStaffStatusSubmit(
                  {
                    ...staff,
                    shopDeliveryStaffStatus: ShopDeliveryStaffStatus.Off,
                  },
                  () => {
                    globalStaffState.setModel({
                      ...staff,
                      shopDeliveryStaffStatus: ShopDeliveryStaffStatus.Off,
                    });
                    Toast.show({
                      type: "success",
                      text1: "Hoàn tất",
                      text2: `Đã chuyển ${staff.fullName} sang trạng thái nghỉ phép.`,
                      // time: 15000
                    });
                    // toast.show(
                    //   `Đã chuyển ${staff.fullName} sang trạng thái nghỉ phép`,
                    //   {
                    //     type: "success",
                    //     duration: 2000,
                    //   }
                    // );
                  },
                );
              },
            },
            {
              text: "Khóa tài khoản",
              onPress: async () => {
                if (isCreatedMode) {
                  setModel({
                    ...staff,
                    shopDeliveryStaffStatus: ShopDeliveryStaffStatus.Inactive,
                  });
                  return;
                }
                onChangeStaffStatusSubmit(
                  {
                    ...staff,
                    shopDeliveryStaffStatus: ShopDeliveryStaffStatus.Inactive,
                  },
                  () => {
                    globalStaffState.setModel({
                      ...staff,
                      shopDeliveryStaffStatus: ShopDeliveryStaffStatus.Inactive,
                    });
                    Toast.show({
                      type: "success",
                      text1: "Hoàn tất",
                      text2: `Đã khóa tài khoản ${staff.fullName} `,
                      // time: 15000
                    });
                    // toast.show(`Đã khóa tài khoản ${staff.fullName} `, {
                    //   type: "info",
                    //   duration: 2000,
                    // });
                  },
                );
              },
            },
            {
              text: "Hủy",
            },
          ],
        );
      };
    } else {
      onSwitchTouch = () => {
        Alert.alert(
          `Xác nhận`,
          staff.shopDeliveryStaffStatus == 2
            ? `Chuyển trạng thái của ${staff.fullName} sang trạng thái hoạt động?`
            : `Xác nhận mở khóa tài khoản ${staff.fullName}?`,
          [
            {
              text: `Xác nhận`,
              onPress: async () => {
                if (isCreatedMode) {
                  setModel({
                    ...staff,
                    shopDeliveryStaffStatus: ShopDeliveryStaffStatus.On,
                  });
                  return;
                }
                onChangeStaffStatusSubmit(
                  {
                    ...staff,
                    shopDeliveryStaffStatus: ShopDeliveryStaffStatus.On,
                  },
                  () => {
                    globalStaffState.setModel({
                      ...staff,
                      shopDeliveryStaffStatus: 1,
                    });
                    Toast.show({
                      type: "success",
                      text1: "Hoàn tất",
                      text2: `Đã chuyển trạng thái của ${staff.fullName} sang trạng thái hoạt động.`,
                      // time: 15000
                    });
                    // toast.show(
                    //   `Đã chuyển trạng thái của ${staff.fullName} sang trạng thái hoạt động`,
                    //   {
                    //     type: "success",
                    //     duration: 2000,
                    //   }
                    // );
                  },
                );
              },
            },
            {
              text: "Hủy",
            },
          ],
        );
      };
    }
    return (
      <View
        className="flex-row items-center rounded-lg w-28"
        style={{ backgroundColor: "#fefce8" }}
      >
        <View className="scale-50 h-6 items-center justify-center ml-[-4px]">
          <Switch
            color="#22c55e"
            value={staff.shopDeliveryStaffStatus == 1}
            onValueChange={(value) => {
              onSwitchTouch();
            }}
          />
        </View>
        <Text className="text-[11px] italic text-gray-500 mr-2 ml-[-4px]">
          {label}
        </Text>
      </View>
    );
  };

  const details = (
    <View>
      <View className="flex-row items-start justify-between">
        <View>
          <Text className={`${titleStyleClasses}`}>Thông tin nhân viên</Text>
          <Text className="text-[11px] italic text-gray-500 mt-[4px]">
            Đã thêm vào{" "}
            {dayjs(globalStaffState.model.createdDate)
              .local()
              .format("HH:mm DD/MM/YYYY")}{" "}
          </Text>
        </View>

        {getStaffStatusComponent(globalStaffState.model)}
      </View>
      <View className="gap-y-2 mt-1">
        <View className="mb-2">
          <Text className="font-bold text-[12.8px]">Tên nhân viên</Text>
          <View className="relative">
            <TextInput
              className="border border-gray-300 mt-1 px-3 pt-2 rounded text-[15px] pb-3"
              value={globalStaffState.model.fullName}
              onChangeText={(text) => {}}
              keyboardType="numeric"
              readOnly
              placeholderTextColor="#888"
            />
            {/* <Text className="absolute right-3 top-4 text-[12.8px] italic">
        đồng
      </Text> */}
          </View>
        </View>
        <View className="mb-2">
          <Text className="font-bold text-[12.8px]">Email</Text>
          <TextInput
            className="border border-gray-300 mt-1 p-2 rounded text-[15px]"
            value={globalStaffState.model.email}
            readOnly
            placeholderTextColor="#888"
          />
        </View>
        <View className="mb-2">
          <Text className="font-bold text-[12.8px]">Số điện thoại</Text>
          <TextInput
            className="border border-gray-300 mt-1 p-2 rounded text-[15px]"
            value={globalStaffState.model.phoneNumber}
            readOnly
            placeholderTextColor="#888"
            placeholder="Chưa có thông tin"
          />
        </View>

        <CustomButton
          title="Chỉnh sửa thông tin"
          handlePress={() => {
            globalStaffState.setIsDetailsOrUpdateOrCreateMode(
              StaffModalAction.Update,
            );
            setModel(globalStaffState.model);
          }}
          containerStyleClasses="mt-2 w-full h-[40px] px-4 bg-transparent border-2 border-gray-200 bg-secondary-100 font-semibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
        />
        <CustomButton
          title="Xóa nhân viên này"
          isLoading={isSubmitting}
          handlePress={() => {
            Alert.alert(`Xác nhận`, `Bạn chắc chắn muốn xóa nhân viên này`, [
              {
                text: `Xác nhận`,
                onPress: async () => {
                  onDelete(globalStaffState.model, () => {
                    globalStaffState.onAfterCompleted();
                    globalStaffState.setIsDetailsModalVisible(false);
                    Toast.show({
                      type: "success",
                      text1: "Hoàn tất",
                      text2: `Đã xóa tài khoản ${globalStaffState.model.fullName}.`,
                    });
                  });
                },
              },
              {
                text: "Hủy",
              },
            ]);
          }}
          containerStyleClasses="mt-2 w-full h-[36px] px-4 bg-transparent border-[1px] border-gray-400 font-semibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[14px] text-gray-900 ml-1 text-white text-gray-500"
        />
      </View>
    </View>
  );

  const validate = (model: ShopDeliveryStaffModel) => {
    let tempErrors: any = {};
    if (model.fullName.length < 4) {
      // console.log(withdrawal.amount, withdrawal.amount < 50000);
      tempErrors.fullName = "Vui lòng nhập tên từ 4 kí tự trở lên.";
    }
    if (model.fullName.length == 0) {
      tempErrors.fullName = "Vui lòng nhập tên nhân viên.";
    }
    if (!CONSTANTS.REGEX.email.test(model.email)) {
      tempErrors.email = "Vui lòng email hợp lệ.";
    }
    if (model.email.length == 0) {
      tempErrors.email = "Vui lòng email nhân viên.";
    }
    if (!CONSTANTS.REGEX.phone.test(model.phoneNumber)) {
      tempErrors.phoneNumber = "Vui lòng nhập số điện thoại hợp lệ.";
    }
    if (model.phoneNumber.length == 0) {
      tempErrors.phoneNumber = "Vui lòng nhập số điện thoại nhân viên.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const numericFields: string[] = [];
  const handleChange = (name: string, value: string) => {
    const newValue = numericFields.includes(name)
      ? Number(utilService.parseFormattedNumber(value))
      : value;
    // console.log(value, utilService.parseFormattedNumber(value), newValue);

    if (isAnyRequestSubmit.current) {
      validate({
        ...model,
        [name]: newValue,
      });
    }

    setModel({
      ...model,
      [name]: newValue,
    });
    // console.log({
    //   ...promotion,
    //   [name]: newValue,
    // });
  };
  const handleSubmit = (model: ShopDeliveryStaffModel) => {
    isAnyRequestSubmit.current = true;
    if (!validate(model)) {
      console.log(errors);
      Alert.alert("Oops!", "Vui lòng hoàn thành thông tin hợp lệ");
      return;
    }

    setIsSubmitting(true);
    if (
      globalStaffState.isDetailsOrUpdateOrCreateMode == StaffModalAction.Create
    )
      apiClient
        .post("shop-owner/delivery-staff/create", {
          ...model,
          avatarUrl: CONSTANTS.url.avatarDefault,
          shopDeliveryStaffStatus: model.shopDeliveryStaffStatus,
          password: "123456",
        })
        .then((res) => {
          let result = res.data as ValueResponse<ShopDeliveryStaffModel>;

          if (result.isSuccess) {
            globalStaffState.setModel({
              ...model,
              ...result.value,
            });
            globalStaffState.setIsDetailsOrUpdateOrCreateMode(
              StaffModalAction.Details,
            );
            Toast.show({
              type: "success",
              text1: "Hoàn tất",
              text2: `Thêm nhân viên ${model.fullName} thành công.`,
              // time: 15000
            });
            globalStaffState.onAfterCompleted();
            // toast.show(`Cập nhật thông tin thành công`, {
            //   type: "success",
            //   duration: 1500,
            // });
          }
        })
        .catch((error: any) => {
          console.log("error?.response?.data: ", model, error?.response?.data);
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!",
          );
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    else
      apiClient
        .put("shop-owner/delivery-staff/info", {
          ...model,
          gender: model.genders,
          status: model.shopDeliveryStaffStatus,
        })
        .then((res) => {
          let result = res.data as ValueResponse<ShopDeliveryStaffModel>;

          if (result.isSuccess) {
            globalStaffState.setModel({
              ...model,
              ...result.value,
            });
            globalStaffState.setIsDetailsOrUpdateOrCreateMode(
              StaffModalAction.Details,
            );
            Toast.show({
              type: "success",
              text1: "Hoàn tất",
              text2: "Cập nhật thông tin nhân viên thành công",
              // time: 15000
            });
            globalStaffState.onAfterCompleted();
            // toast.show(`Cập nhật thông tin thành công`, {
            //   type: "success",
            //   duration: 1500,
            // });
          }
        })
        .catch((error: any) => {
          console.log("error?.response?.data: ", model, error?.response?.data);
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!",
          );
        })
        .finally(() => {
          setIsSubmitting(false);
        });
  };
  const editation = (
    <View>
      <View className="flex-row items-start justify-between">
        <View>
          <Text className={`${titleStyleClasses}`}>Cập nhật thông tin</Text>
          <Text className="text-[9.5px] italic text-gray-500 mt-[4px]">
            Cập nhật gần nhất{" "}
            {dayjs(globalStaffState.model.createdDate)
              .local()
              .format("HH:mm DD/MM/YYYY")}{" "}
          </Text>
        </View>

        {getStaffStatusComponent(globalStaffState.model)}
      </View>
      <View className="gap-y-2 mt-1">
        <View className="mb-2">
          <Text className="font-bold text-[12.8px]">Tên nhân viên</Text>
          <View className="relative">
            <TextInput
              className="border border-gray-300 mt-1 px-3 p-2 rounded text-[15px]"
              value={model.fullName}
              onChangeText={(text) => {
                handleChange("fullName", text);
              }}
              placeholder="Nhập tên nhân viên"
              placeholderTextColor="#888"
              readOnly={
                globalStaffState.isDetailsOrUpdateOrCreateMode ==
                StaffModalAction.Details
              }
            />
            {errors.fullName && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.fullName}
              </Text>
            )}
          </View>
        </View>
        <View className="mb-2">
          <Text className="font-bold text-[12.8px]">Email</Text>
          <TextInput
            className="border border-gray-300 mt-1 p-2 rounded text-[15px]"
            value={model.email}
            onChangeText={(text) => {
              handleChange("email", text);
            }}
            keyboardType="email-address"
            placeholder="Nhập email nhân viên"
            placeholderTextColor="#888"
            readOnly={
              globalStaffState.isDetailsOrUpdateOrCreateMode ==
              StaffModalAction.Details
            }
          />
          {errors.email && (
            <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
          )}
        </View>
        <View className="mb-2">
          <Text className="font-bold text-[12.8px]">Số điện thoại</Text>
          <TextInput
            className="border border-gray-300 mt-1 p-2 rounded text-[15px]"
            value={model.phoneNumber}
            onChangeText={(text) => {
              handleChange("phoneNumber", text);
            }}
            keyboardType="numeric"
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#888"
            readOnly={
              globalStaffState.isDetailsOrUpdateOrCreateMode ==
              StaffModalAction.Details
            }
          />
          {errors.phoneNumber && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.phoneNumber}
            </Text>
          )}
        </View>

        <CustomButton
          title="Cập nhật thông tin"
          isLoading={isSubmitting}
          handlePress={() => {
            handleSubmit(model);
          }}
          containerStyleClasses="mt-2 w-full h-[40px] px-4 bg-transparent border-2 border-gray-200 bg-secondary-100 font-semibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
        />
        <CustomButton
          title="Hủy"
          isLoading={isSubmitting}
          handlePress={() => {
            globalStaffState.setIsDetailsOrUpdateOrCreateMode(
              StaffModalAction.Details,
            );
          }}
          containerStyleClasses="mt-2 w-full h-[36px] px-4 bg-transparent border-[1px] border-gray-400 font-semibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[14px] text-gray-900 ml-1 text-white text-gray-500"
        />
      </View>
    </View>
  );
  const creation = (
    <View>
      <View className="flex-row items-start justify-between">
        <View>
          <Text className={`${titleStyleClasses}`}>Tạo mới nhân viên</Text>
        </View>

        {getStaffStatusComponent(model, true)}
      </View>
      <View className="gap-y-2 mt-1">
        <View className="mb-2">
          <Text className="font-bold text-[12.8px]">Tên nhân viên</Text>
          <View className="relative">
            <TextInput
              className="border border-gray-300 mt-1 px-3 pt-2 rounded text-[15px] pb-3"
              value={model.fullName}
              onChangeText={(text) => {
                handleChange("fullName", text);
              }}
              placeholder="Nhập tên nhân viên"
              placeholderTextColor="#888"
              readOnly={
                globalStaffState.isDetailsOrUpdateOrCreateMode ==
                StaffModalAction.Details
              }
            />
            {errors.fullName && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.fullName}
              </Text>
            )}
          </View>
        </View>
        <View className="mb-2">
          <Text className="font-bold text-[12.8px]">Email</Text>
          <TextInput
            className="border border-gray-300 mt-1 p-2 rounded text-[15px]"
            value={model.email}
            onChangeText={(text) => {
              handleChange("email", text);
            }}
            keyboardType="email-address"
            placeholder="Nhập email nhân viên"
            placeholderTextColor="#888"
            readOnly={
              globalStaffState.isDetailsOrUpdateOrCreateMode ==
              StaffModalAction.Details
            }
          />
          {errors.email && (
            <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
          )}
        </View>
        <View className="mb-2">
          <Text className="font-bold text-[12.8px]">Số điện thoại</Text>
          <TextInput
            className="border border-gray-300 mt-1 p-2 rounded text-[15px]"
            value={model.phoneNumber}
            onChangeText={(text) => {
              handleChange("phoneNumber", text);
            }}
            keyboardType="numeric"
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#888"
            readOnly={
              globalStaffState.isDetailsOrUpdateOrCreateMode ==
              StaffModalAction.Details
            }
          />
          {errors.phoneNumber && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.phoneNumber}
            </Text>
          )}
        </View>

        <CustomButton
          title="Thêm mới"
          isLoading={isSubmitting}
          handlePress={() => {
            handleSubmit(model);
          }}
          containerStyleClasses="mt-2 w-full h-[40px] px-4 bg-transparent border-2 border-gray-200 bg-secondary-100 font-semibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
        />
      </View>
    </View>
  );
  return (
    <Modal
      backdropOpacity={0.25}
      isVisible={globalStaffState.isDetailsModalVisible}
      onBackdropPress={() => globalStaffState.setIsDetailsModalVisible(false)}
    >
      <View style={{ zIndex: 100 }} className="justify-center items-center">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View
            className={`bg-white w-80 p-4 rounded-lg  ${containerStyleClasses}`}
          >
            {globalStaffState.isDetailsOrUpdateOrCreateMode == 1
              ? details
              : globalStaffState.isDetailsOrUpdateOrCreateMode == 2
                ? editation
                : creation}
          </View>
        </TouchableWithoutFeedback>
      </View>
      <Toast position="top" />
    </Modal>
  );
};

export default StaffDetailsModal;
