import CustomButton from "@/components/custom/CustomButton";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import OTPTextView from "react-native-otp-textinput";
const SampleEmailVerification = ({
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
export default SampleEmailVerification;
