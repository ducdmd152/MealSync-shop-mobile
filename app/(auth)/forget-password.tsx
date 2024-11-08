import { View, Text, Image } from "react-native";
import React, { ReactNode, useState } from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import FormFieldCustom from "@/components/custom/FormFieldCustom";
import { images } from "@/constants";

const ForgetPassword = () => {
  const [step, setStep] = useState(1); // 1. Enter email 2. Verify code 3. Enter password
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const enterEmail = (
    <View className="w-full p-4">
      <FormFieldCustom
        title={"Nhập email đã đăng ký"}
        value={data.email}
        placeholder={"Nhập email của bạn..."}
        handleChangeText={(text) => {
          setData({ ...data, email: text });
        }}
        keyboardType="email-address"
        otherStyleClasses="mt-7"
      />
    </View>
  );
  const componentOfSteps: ReactNode[] = [enterEmail];
  return (
    <PageLayoutWrapper>
      <View className="w-full h-full justify-center items-center px-4">
        <Image
          source={images.signInLogo1}
          resizeMode="contain"
          className="h-[80px]"
        />
        <Text className="text-2xl text-gray text-semibold mt-10 font-semibold">
          Khôi phục mật khẩu
        </Text>
        <View className="w-full justify-center items-center px-4 shink-0">
          {componentOfSteps[step - 1]}
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default ForgetPassword;
