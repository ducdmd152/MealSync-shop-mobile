import React, { useEffect, useRef, useState } from "react";
import { View, Button, Text, Alert } from "react-native";
import OTPTextView from "react-native-otp-textinput";
import CustomButton from "../custom/CustomButton";
import { router } from "expo-router";
import sessionService from "@/services/session-service";

const SignUpVerification = () => {
  const lengthOfCode = 4;
  const [code, setCode] = useState("");
  const otpInput = useRef<OTPTextView | null>(null);
  const [email, setEmail] = useState("");

  const clearText = () => {
    if (otpInput.current) {
      otpInput.current.clear();
    }
  };

  useEffect(() => {
    (async () => {
      const mail = await sessionService.getAuthEmail();
      if (email != null) setEmail(mail || "");
    })();
  }, []);

  const onVerify = () => {
    if (code.length < lengthOfCode)
      Alert.alert("Hoàn thành nhập liệu", "Vui lòng nhập đầy đủ mã xác thực!");
    else {
      console.log("Verifying code: " + code);
      router.replace("/home");
    }
  };

  //   const setText = () => {
  //     if (otpInput.current) {
  //         otpInput.current.setValue("1234");
  //     }
  //   };

  return (
    <View className="mt-4">
      <Text className="text-lg text-gray-500 text-center text-semibold mt-2 font-semibold">
        Mã xác thực đã được gửi qua {email}
      </Text>
      <OTPTextView
        inputCount={lengthOfCode}
        ref={otpInput}
        handleTextChange={(text) => {
          setCode(text);
        }}
      />
      <CustomButton
        title="Xác thực"
        handlePress={() => onVerify()}
        containerStyleClasses="min-h-[52px] mt-6 bg-primary"
        textStyleClasses="text-[16px] text-white"
      />
      <CustomButton
        title="Nhập lại"
        handlePress={clearText}
        containerStyleClasses="min-h-[52px] mt-4 border-2 border-gray-600 bg-white"
        textStyleClasses="text-[16px] text-gray-600"
      />
      {/* <CustomButton
        title="Quay trở lại"
        handlePress={setText}
        containerStyleClasses="min-h-[40px] mt-4 border-2 border-gray-600 bg-white"
        textStyleClasses="text-[16px] text-gray-600"
      /> */}
    </View>
  );
};

export default SignUpVerification;
