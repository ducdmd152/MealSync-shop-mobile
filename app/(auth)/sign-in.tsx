import CustomButton from "@/components/custom/CustomButton";
import FormFieldCustom from "@/components/custom/FormFieldCustom";
import { images } from "@/constants";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Image, SafeAreaView, ScrollView, Text, View } from "react-native";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  return (
    <SafeAreaView className="h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full h-full justify-center items-center px-4">
          <Image
            source={images.signInLogo1}
            resizeMode="contain"
            className="h-[80px]"
          />
          <Text className="text-2xl text-gray text-semibold mt-10 font-psemibold">
            Đăng nhập
          </Text>
          <FormFieldCustom
            title={"Email"}
            value={form.email}
            placeholder={"Nhập email của bạn..."}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            keyboardType="email-address"
            otherStyleClasses="mt-7"
          />

          <FormFieldCustom
            title={"Mật khẩu"}
            value={form.password}
            placeholder={"Nhập mật khẩu..."}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            isPassword={true}
            otherStyleClasses="mt-7"
          />
          <CustomButton
            title="Đăng nhập"
            handlePress={() => {
              router.replace("/home");
            }}
            containerStyleClasses="bg-primary w-full mt-7"
            textStyleClasses="text-white"
            isLoading={isSubmitting}
          />
          <View className="justify-center items-center pt-2 gap-2 mt-2">
            <Text className="text-lg text-black font-regular text-center">
              Bạn chưa có tài khoản?{" "}
              <Link
                href="/sign-up"
                className="text-white text-primary font-psemibold"
              >
                Đăng ký
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
