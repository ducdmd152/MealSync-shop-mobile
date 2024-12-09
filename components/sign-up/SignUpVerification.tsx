import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Button, Text, Alert } from "react-native";
import OTPTextView from "react-native-otp-textinput";
import CustomButton from "../custom/CustomButton";
import { router, useFocusEffect } from "expo-router";
import sessionService from "@/services/session-service";
import SampleEmailVerification from "../common/SampleEmailVerification";
import apiClient from "@/services/api-services/api-client";
import Toast from "react-native-toast-message";

const SignUpVerification = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(true);
  const handleSubmit = (code: number) => {
    setIsSubmitting(true);
    apiClient
      .post("auth/verify-code", {
        isVerify: true,
        email: email.toLowerCase(),
        code: code,
        verifyType: 2,
      })
      .then(() => {
        router.replace("/sign-in");

        Toast.show({
          type: "success",
          text1: "Hoàn tất",
          text2: `Đăng ký tài khoản và cửa hàng thành công, đăng nhập ngay.`,
        });
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
  const onResendCode = () => {
    setIsSubmitting(true);
    apiClient
      .post("auth/send-code", {
        email: email,
        verifyType: 2,
      })
      .then(() => {})
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

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const mail = await sessionService.getAuthEmail();
        if (email != null) setEmail(mail || "");
      })();
    }, [])
  );
  //   const setText = () => {
  //     if (otpInput.current) {
  //         otpInput.current.setValue("1234");
  //     }
  //   };

  return (
    <SampleEmailVerification
      handleSubmit={(code: number) => {
        handleSubmit(code);
      }}
      isSubmitting={isSubmitting}
      onResendCode={() => {
        onResendCode();
      }}
      limit={2 * 60}
      email={email}
    />
  );
};

export default SignUpVerification;
