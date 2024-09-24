import CustomButton from "@/components/custom/CustomButton";
import CustomCheckbox from "@/components/custom/CustomCheckbox";
import FormFieldCustom from "@/components/custom/FormFieldCustom";
import SignUpVerification from "@/components/sign-up/SignUpVerification";
import { images } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { CheckBox } from "react-native-elements";
import { Checkbox } from "react-native-paper";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAcceptedPolicy, setIsAcceptedPolicy] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const onSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields!");
    }
    setIsSubmitting(true);
    try {
      // const result = await createUser(form.username, form.email, form.password);
      // set it to global state
      setStep(2);
      // router.replace("/home");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong!");
    }
    setIsSubmitting(false);
  };
  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerStyle={{ height: "100%", flexShrink: 0 }}>
        <View className="w-full min-h-full justify-start items-center px-4 shink-0">
          <Image
            source={images.signInLogo1}
            resizeMode="contain"
            className="h-[60px]"
          />
          <Text className="text-2xl text-gray text-semibold mt-2 font-psemibold">
            Đăng ký
          </Text>

          {step == 2 ? (
            <SignUpVerification />
          ) : step == 0 ? (
            <View className="w-full justify-between">
              <FormFieldCustom
                title={"Chủ cửa hàng"}
                value={form.name}
                placeholder={"Nhập tên chủ cửa hàng..."}
                handleChangeText={(e) => setForm({ ...form, name: e })}
                keyboardType="default"
                otherStyleClasses="mt-2"
              />
              <FormFieldCustom
                title={"Email"}
                value={form.email}
                placeholder={"Nhập email của bạn..."}
                handleChangeText={(e) => setForm({ ...form, email: e })}
                keyboardType="email-address"
                otherStyleClasses="mt-2"
              />

              <FormFieldCustom
                title={"Mật khẩu"}
                value={form.password}
                placeholder={"Nhập mật khẩu..."}
                handleChangeText={(e) => setForm({ ...form, password: e })}
                isPassword={true}
                otherStyleClasses="mt-3"
              />
              <FormFieldCustom
                title={"Xác nhận mật khẩu"}
                value={form.password}
                placeholder={"Xác nhận mật khẩu..."}
                handleChangeText={(e) => setForm({ ...form, password: e })}
                isPassword={true}
                otherStyleClasses="mt-3"
              />
              <CustomButton
                title="Tiếp tục"
                handlePress={() => {
                  setStep(1);
                }}
                iconRight={
                  <Ionicons
                    name="arrow-forward-outline"
                    size={22}
                    color="white"
                  />
                }
                containerStyleClasses="bg-primary w-full mt-3 "
                textStyleClasses="text-white mr-2"
                isLoading={isSubmitting}
              />
            </View>
          ) : (
            <View className="w-full">
              <FormFieldCustom
                title={"Tên cửa hàng"}
                value={form.name}
                placeholder={"Nhập tên cửa hàng..."}
                handleChangeText={(e) => setForm({ ...form, name: e })}
                keyboardType="default"
                otherStyleClasses="mt-3"
              />
              <FormFieldCustom
                title={"Số điện thoại"}
                value={form.email}
                placeholder={"Nhập số điện thoại..."}
                handleChangeText={(e) => setForm({ ...form, email: e })}
                keyboardType="email-address"
                otherStyleClasses="mt-3"
              />

              <FormFieldCustom
                title={"Địa chỉ cửa hàng"}
                value={form.password}
                readOnly
                placeholder={"Chọn địa chỉ cửa hàng..."}
                handleChangeText={(e) => setForm({ ...form, password: e })}
                otherStyleClasses="mt-3"
                iconRight={
                  <TouchableOpacity className="h-[40px] w-[40px] bg-primary rounded-md justify-center items-center relative">
                    <Ionicons name="location-outline" size={28} color="white" />
                  </TouchableOpacity>
                }
              />
              <CustomCheckbox
                isChecked={isAcceptedPolicy}
                handlePress={() => setIsAcceptedPolicy(!isAcceptedPolicy)}
                label={
                  <Text>
                    Đồng ý với{" "}
                    <Text
                      style={{
                        color: "blue-200",
                        textDecorationLine: "underline",
                      }}
                    >
                      chính sách dành cho cửa hàng
                    </Text>{" "}
                    trên hệ thống MealSync
                  </Text>
                }
              />

              <CustomButton
                title="Hoàn tất đăng ký"
                handlePress={() => {
                  onSubmit();
                  // setStep(2);
                }}
                iconRight={<Text className="text-primary">{" --->"}</Text>}
                containerStyleClasses="w-full mt-3 bg-primary"
                textStyleClasses="text-white"
                isLoading={isSubmitting}
                isDisabled={!isAcceptedPolicy}
              />
              <CustomButton
                title="Quay trở lại"
                handlePress={() => {
                  setStep(0);
                }}
                iconLeft={
                  <Ionicons name="arrow-back-outline" size={22} color="gray" />
                }
                containerStyleClasses="w-full mt-4 bg-white border-gray-500 border-2"
                textStyleClasses="ml-2 text-gray-600"
                isLoading={isSubmitting}
              />
            </View>
          )}

          {step != 2 && (
            <View className="justify-center pt-5 gap-2">
              <Text className="text-lg text-gray-100 font-regular text-center">
                Bạn đã có tài khoản?{" "}
                <Link
                  href="/sign-in"
                  className="text-white text-primary font-psemibold"
                >
                  Đăng nhập
                </Link>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
