import { View, Text, Image, Alert } from "react-native";
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

const ForgetPassword = () => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1. Enter email 2. Verify code 3. Enter password
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    code: 0,
  });

  const requestSendCode = () => {
    setIsSubmitting(true);
    apiClient
      .post("auth/send-code", {
        email: data.email.trim(),
        verifyType: 3,
      })
      .then(() => {
        setData({ ...data, email: data.email.toLowerCase() });
        setStep(2);
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          Alert.alert("Oops!", "Không tìm thấy tài khoản với email tương ứng");
        } else {
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!"
          );
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const requestUpdatePassword = (
    code: number = data.code,
    isVerifying: boolean = false
  ) => {
    setIsSubmitting(true);
    apiClient
      .post("auth/verify-code", {
        isVerify: isVerifying,
        email: data.email,
        code: code,
        verifyType: 3,
        password: isVerifying ? undefined : data.password,
      })
      .then(() => {
        if (isVerifying) {
          setStep(3);
          toast.show(`Xác thực email hợp lệ.`, {
            type: "success",
            duration: 1500,
          });
        } else {
          router.replace("/sign-in");
          Toast.show({
            type: "success",
            text1: "Hoàn tất",
            text2: `Cập nhật mật khẩu thành công.\nĐăng nhập với mật khẩu mới!.`,
          });
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          Alert.alert("Oops!", "Không tìm thấy tài khoản với email tương ứng");
          router.replace("/sign-in");
        } else {
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!"
          );
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const enterEmail = (
    <View className="w-full p-4 pb-16">
      <FormFieldCustom
        className="text-center mb-1"
        title={"Nhập email đã đăng ký"}
        value={data.email}
        placeholder={"Nhập email của bạn..."}
        handleChangeText={(text) => {
          setData({ ...data, email: text });
        }}
        keyboardType="email-address"
        titleStyleClasses="text-center w-full mb-2"
        otherStyleClasses="mt-7"
        otherInputStyleClasses="text-center"
        otherTextInputStyleClasses="text-center"
      />
      <CustomButton
        title="Tiếp tục"
        handlePress={() => {
          if (!CONSTANTS.REGEX.email.test(data.email.trim())) {
            Alert.alert("Vui lòng nhập email hợp lệ!");
            return;
          }
          requestSendCode();
        }}
        isDisabled={!CONSTANTS.REGEX.email.test(data.email.trim())}
        containerStyleClasses="bg-primary w-full mt-7"
        textStyleClasses="text-white"
        isLoading={isSubmitting}
      />
    </View>
  );
  const verifyCode = (
    <View className="w-full p-4 pb-16">
      <ForgetPasswordVerification
        handleSubmit={(code: number) => {
          setData({ ...data, code: code });
          requestUpdatePassword(code, true);
        }}
        isSubmitting={isSubmitting}
        onResendCode={() => {
          console.log("Email submit: ", data.email.trim());
          requestSendCode();
        }}
        limit={2 * 60}
        email={data.email}
      />
    </View>
  );
  const passwordUpdate = (
    <View className="w-full p-4 pb-16">
      <FormFieldCustom
        title={"Mật khẩu mới *"}
        value={data.password}
        placeholder={"Nhập mật khẩu mới..."}
        handleChangeText={(e) => setData({ ...data, password: e })}
        isPassword={true}
        otherStyleClasses="mt-3"
        className="mb-1"
      />
      <FormFieldCustom
        title={"Xác nhận mật khẩu *"}
        value={data.confirmPassword}
        placeholder={"Xác nhận mật khẩu..."}
        handleChangeText={(e) => setData({ ...data, confirmPassword: e })}
        isPassword={true}
        otherStyleClasses="mt-3"
        className="mb-1"
      />
      <CustomButton
        title="Cập nhật"
        handlePress={() => {
          if (data.password != data.confirmPassword) {
            Alert.alert("Mật khẩu không trùng khớp, vui lòng kiểm tra lại!");
            return;
          }
          requestUpdatePassword();
        }}
        isDisabled={!CONSTANTS.REGEX.email.test(data.email.trim())}
        containerStyleClasses="bg-primary w-full mt-7"
        textStyleClasses="text-white"
        isLoading={isSubmitting}
      />
    </View>
  );
  const componentOfSteps: ReactNode[] = [
    enterEmail,
    verifyCode,
    passwordUpdate,
  ];
  return (
    <PageLayoutWrapper>
      <View className="w-full h-full justify-center items-center p-4 ">
        <Image
          source={images.signInLogo1}
          resizeMode="contain"
          className="h-[80px]"
        />
        <Text className="text-2xl text-gray text-semibold mt-10 font-semibold">
          Khôi phục mật khẩu
        </Text>
        <View className="w-full justify-center items-center shink-0">
          {componentOfSteps[step - 1]}
        </View>
        <View className="justify-center items-center pt-2 gap-2 mt-2">
          <Text className="text-lg text-black font-regular text-center">
            <Link
              href="/sign-in"
              className="text-white text-primary font-semibold"
            >
              Quay về đăng nhập
            </Link>
          </Text>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default ForgetPassword;
const ForgetPasswordVerification = ({
  email,
  limit,
  handleSubmit,
  onResendCode,
}: {
  email: string;
  limit: number;
  handleSubmit: (code: number) => void;
  onResendCode: () => void;
  isSubmitting: boolean;
}) => {
  const intervalIdRef = useRef<any>(null);
  const [timeSecondsCounter, setTimeSecondsCounter] = useState(0);
  const lengthOfCode = 4;
  const [code, setCode] = useState("");
  const otpInput = useRef<OTPTextView | null>(null);

  const clearText = () => {
    if (otpInput.current) {
      otpInput.current.clear();
    }
  };
  useEffect(() => {
    if (code.length == lengthOfCode) handleSubmit(Number(code));
  }, [code]);
  const resetTimeCounter = () => {
    setTimeSecondsCounter(limit);
    const intervalId = setInterval(() => {
      setTimeSecondsCounter((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1010);
    intervalIdRef.current = intervalId;
  };
  useFocusEffect(
    React.useCallback(() => {
      resetTimeCounter();
    }, [])
  );

  return (
    <View className="mt-4">
      <Text className="text-lg text-gray-500 text-center text-semibold mt-2 font-semibold">
        Mã xác thực đã được gửi qua {email}
      </Text>
      <Text className="text-lg text-gray-500 text-center text-semibold mt-2">
        Thời gian còn lại{" "}
        {Math.floor(timeSecondsCounter / 60)
          .toString()
          .padStart(2, "0") +
          " : " +
          (timeSecondsCounter % 60).toString().padStart(2, "0")}
      </Text>
      <OTPTextView
        inputCount={lengthOfCode}
        ref={otpInput}
        handleTextChange={(text) => {
          setCode(text);
        }}
      />
      {/* <CustomButton
          title="Xác thực"
          handlePress={() => onVerify()}
          containerStyleClasses="min-h-[52px] mt-6 bg-primary"
          textStyleClasses="text-[16px] text-white"
        /> */}
      {/* <CustomButton
          title="Nhập lại"
          handlePress={clearText}
          containerStyleClasses="min-h-[52px] mt-4 border-[1px] border-gray-600 bg-white"
          textStyleClasses="text-[16px] text-gray-600"
        /> */}
      <CustomButton
        // isLoading={isSubmitting}
        title="Nhận mã mới"
        handlePress={() => {
          clearText();
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
          resetTimeCounter();
          onResendCode();
        }}
        containerStyleClasses="h-[40px] mt-4 border-[1px] border-gray-300 bg-white"
        textStyleClasses="text-[16px] text-gray-600 font-medium"
      />
    </View>
  );
};
