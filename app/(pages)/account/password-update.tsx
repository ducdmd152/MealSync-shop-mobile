import { View, Text, Image, Alert, ScrollView } from "react-native";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import FormFieldCustom from "@/components/custom/FormFieldCustom";
import { images } from "@/constants";
import CustomButton from "@/components/custom/CustomButton";
import CONSTANTS from "@/constants/data";
import apiClient from "@/services/api-services/api-client";
import { Link, router, useFocusEffect } from "expo-router";
import OTPTextView from "react-native-otp-textinput";
import { useToast } from "react-native-toast-notifications";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

const PasswordUpdate = () => {
  const toast = useToast();
  const isAnyRequestSubmit = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  useFocusEffect(
    React.useCallback(() => {
      setData({
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
      isAnyRequestSubmit.current = false;
    }, [])
  );

  const [errors, setErrors] = useState<any>({});
  const validate = (submit: {
    currentPassword: string;
    password: string;
    confirmPassword: string;
  }) => {
    let tempErrors: any = {};
    if (submit.currentPassword.length < 8)
      tempErrors.currentPassword = "Mật khẩu tối thiểu 8 kí tự.";
    // if (submit.currentPassword.length == 0)
    //   tempErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại."
    if (CONSTANTS.REGEX.password.test(submit.password) == false)
      tempErrors.password =
        "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 ký tự đặc biệt và 1 số.";

    // console.log(submit.password.length);
    if (submit.password.length < 8)
      tempErrors.password = "Mật khẩu tối thiểu 8 kí tự.";
    // if (submit.password.length == 0)
    //   tempErrors.password = "Vui lòng nhập mật khẩu hiện tại.";
    if (submit.confirmPassword != submit.password)
      tempErrors.confirmPassword = "Mật khẩu không trùng khớp.";
    if (submit.confirmPassword.length == 0)
      tempErrors.confirmPassword = "Vui lòng nhập xác nhận mật khẩu.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const onFieldChange = (name: string, value: string) => {
    setData({ ...data, [name]: value });
    if (isAnyRequestSubmit.current == true)
      validate({ ...data, [name]: value });
  };
  const [isUnderKeywodFocusing, setIsUnderKeywodFocusing] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  useEffect(() => {
    if (isUnderKeywodFocusing && scrollViewRef?.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isUnderKeywodFocusing, scrollViewRef]);
  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }}>
        <View
          className={`w-full h-full justify-center items-center p-4 px-2 ${
            isUnderKeywodFocusing && "pb-[150px]"
          }`}
        >
          <Image
            source={images.signInLogo1}
            resizeMode="contain"
            className="h-[80px]"
          />
          {/* <Text className="text-2xl text-gray text-semibold mt-10 font-semibold">
          Cập nhật mật khẩu
        </Text> */}
          <View className="w-full justify-center items-center shink-0">
            <View className="w-full p-4 pb-16">
              <FormFieldCustom
                title={"Mật khẩu hiện tại *"}
                value={data.currentPassword}
                placeholder={"Nhập mật khẩu hiện tại..."}
                handleChangeText={(text) =>
                  onFieldChange("currentPassword", text)
                }
                isPassword={true}
                otherStyleClasses="mt-3"
                // className="mb-1"
              />
              {errors.currentPassword && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.currentPassword}
                </Text>
              )}
              <FormFieldCustom
                title={"Mật khẩu mới *"}
                value={data.password}
                placeholder={"Nhập mật khẩu mới..."}
                handleChangeText={(text) => onFieldChange("password", text)}
                isPassword={true}
                otherStyleClasses="mt-3"
                // className="mb-1"
              />
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.password}
                </Text>
              )}
              <FormFieldCustom
                title={"Xác nhận mật khẩu *"}
                value={data.confirmPassword}
                placeholder={"Xác nhận mật khẩu..."}
                handleChangeText={(text) =>
                  onFieldChange("confirmPassword", text)
                }
                isPassword={true}
                otherStyleClasses="mt-3"
                onFocus={() => setIsUnderKeywodFocusing(true)}
                onBlur={() => setIsUnderKeywodFocusing(false)}
                // className="mb-1"
              />
              {errors.confirmPassword && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </Text>
              )}
              <CustomButton
                title="Cập nhật"
                handlePress={() => {
                  isAnyRequestSubmit.current = true;
                  if (!validate(data)) {
                    Alert.alert(
                      "Oops",
                      "Vui lòng hoàn thành thông tin hợp lệ!"
                    );
                    return;
                  }
                  setIsSubmitting(true);
                  apiClient
                    .put("shop-owner/password/update", {
                      oldPassword: data.currentPassword,
                      newPassword: data.password,
                    })
                    .then(() => {
                      router.back();
                      Toast.show({
                        type: "success",
                        text1: "Hoàn tất",
                        text2: `Cập nhật mật khẩu mới thành công!.`,
                      });
                    })
                    .catch((error) => {
                      Alert.alert(
                        "Oops!",
                        error?.response?.data?.error?.message ||
                          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                      );
                    })
                    .finally(() => {
                      setIsSubmitting(false);
                    });
                }}
                //   isDisabled={}
                containerStyleClasses="bg-primary w-full mt-7"
                textStyleClasses="text-white"
                isLoading={isSubmitting}
              />
            </View>
          </View>
          <View className="justify-center items-center pt-2 gap-2 mt-2">
            <Text
              onPress={() => router.back()}
              className="text-lg text-black font-regular text-center text-white text-primary font-semibo"
            >
              Quay về tài khoản
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PasswordUpdate;
