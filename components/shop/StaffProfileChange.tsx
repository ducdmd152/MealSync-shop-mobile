import CONSTANTS from "@/constants/data";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import utilService from "@/services/util-service";
import { ShopDeliveryStaffModel } from "@/types/models/StaffInfoModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import ValueResponse from "@/types/responses/ValueReponse";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useToast } from "react-native-toast-notifications";
import CustomButton from "../custom/CustomButton";
import FormFieldCustom from "../custom/FormFieldCustom";

export const emptyShopDeliveryStaff: ShopDeliveryStaffModel = {
  id: 0,
  phoneNumber: "",
  email: "",
  avatarUrl: "",
  fullName: "",
  genders: 0,
  accountStatus: 0,
  shopDeliveryStaffStatus: 1,
  createdDate: "",
  updatedDate: "",
};

const StaffProfileChange = ({ scrollViewRef }: { scrollViewRef: any }) => {
  const toast = useToast();
  const staffAccount = useFetchWithRQWithFetchFunc(
    [endpoints.STAFF_INFO],
    async (): Promise<FetchValueResponse<ShopDeliveryStaffModel>> =>
      apiClient.get(endpoints.STAFF_INFO).then((response) => response.data),
    [],
  );
  useFocusEffect(
    React.useCallback(() => {
      if (staffAccount.isFetched) staffAccount.refetch();
    }, []),
  );
  const [model, setModel] = useState<ShopDeliveryStaffModel>(
    emptyShopDeliveryStaff,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAnyRequestSubmit = useRef(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUnderKeywodFocusing, setIsUnderKeywodFocusing] = useState(false);
  useEffect(() => {
    // console.log(isUnderKeywodFocusing);
    if (isUnderKeywodFocusing && scrollViewRef?.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isUnderKeywodFocusing, scrollViewRef]);

  useEffect(() => {
    staffAccount.refetch();
    isAnyRequestSubmit.current = false;
  }, [isEditMode]);
  useEffect(() => {
    if (!staffAccount.isFetching && staffAccount.data?.value)
      setModel(staffAccount.data?.value);
  }, [staffAccount.isFetching]);

  const [errors, setErrors] = useState<any>({});
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
    apiClient
      .put(endpoints.STAFF_INFO_UPDATE, {
        ...model,
        gender: model.genders,
        status: model.shopDeliveryStaffStatus,
      })
      .then((res) => {
        let result = res.data as ValueResponse<ShopDeliveryStaffModel>;

        if (result.isSuccess) {
          setIsEditMode(false);
          setModel({
            ...model,
            ...result.value,
          });
          staffAccount.refetch();
          Toast.show({
            type: "success",
            text1: "Hoàn tất",
            text2: "Cập nhật hồ sơ thành công",
            // time: 15000
          });
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
  return (
    <View
      className={`w-full px-4 py-2 ${isUnderKeywodFocusing && "pb-[160px]"}`}
    >
      <Text className="text-center text-[16px] text-gray-600 font-semibold mt-2 mt-[-10px]">
        {staffAccount.data?.value.email}
      </Text>
      {/* <TouchableOpacity
        className=" "
        onPress={() => {
          router.push("/account/email-update");
        }}
      >
        <Text className="text-center text-[12.8px] text-[#818cf8] font-semibold mt-2">
          Cập nhật email
        </Text>
      </TouchableOpacity> */}
      {!isEditMode && (
        <TouchableOpacity
          className="mt-[-2px] "
          onPress={() => {
            setIsEditMode(true);
            // toast.show(
            //   `Bạn đang trong chế độ chỉnh sửa, vui lòng thay đổi và cập nhật thông tin.`,
            //   {
            //     type: "normal",
            //     duration: 1500,
            //     normalColor: "#06b6d4",
            //   }
            // );
          }}
        >
          <Text className="text-center text-[12.8px] text-[#818cf8] font-semibold mt-2">
            Chỉnh sửa thông tin
          </Text>
        </TouchableOpacity>
      )}
      <FormFieldCustom
        title={"Họ và tên"}
        value={model.fullName}
        readOnly={true}
        placeholder={"Nhập tên của bạn..."}
        handleChangeText={(text) => {
          handleChange("fullName", text);
        }}
        keyboardType="default"
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100 "
        // className="mb-1"
      />
      {errors.fullName && (
        <Text className="text-red-500 text-xs mt-1">{errors.fullName}</Text>
      )}
      <FormFieldCustom
        title={"Số điện thoại"}
        value={model.phoneNumber}
        readOnly={!isEditMode}
        placeholder="Nhập số điện thoại"
        handleChangeText={(text) => {
          handleChange("phoneNumber", text);
        }}
        keyboardType="default"
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
        onFocus={() => setIsUnderKeywodFocusing(true)}
        onBlur={() => setIsUnderKeywodFocusing(false)}
      />
      {errors.phoneNumber && (
        <Text className="text-red-500 text-xs mt-1">{errors.phoneNumber}</Text>
      )}

      {isEditMode && (
        <CustomButton
          title="Cập nhật"
          isLoading={isSubmitting}
          containerStyleClasses="mt-5 bg-secondary h-12"
          textStyleClasses="text-white"
          handlePress={() => {
            handleSubmit(model);
          }}
        />
      )}
      {isEditMode && (
        <CustomButton
          title="Hủy"
          handlePress={() => {
            setIsEditMode(false);
          }}
          containerStyleClasses="mt-2 w-full h-[44px] px-4 bg-transparent border-[1px] border-gray-400 font-semibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[17px] text-gray-900 ml-1 text-white text-gray-500"
        />
      )}
      {!isEditMode && (
        <CustomButton
          title="Cập nhật email"
          handlePress={() => {
            router.push("/account/email-update");
          }}
          iconRight={
            <Ionicons name="arrow-forward-outline" size={22} color="white" />
          }
          containerStyleClasses="bg-primary-100 w-full mt-3 h-12 mt-3"
          textStyleClasses="text-white mr-2"
          isLoading={isSubmitting}
        />
      )}
    </View>
  );
};

export default StaffProfileChange;
