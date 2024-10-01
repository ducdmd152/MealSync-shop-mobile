import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import FormFieldCustom from "../custom/FormFieldCustom";
import CustomCheckbox from "../custom/CustomCheckbox";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../custom/CustomButton";

const ShopProfileChange = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAcceptedPolicy, setIsAcceptedPolicy] = useState(false);
  const [hasA, setHasA] = useState(true);
  const [hasB, setHasB] = useState(true);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  return (
    <View className="w-full px-4 py-2 ">
      {/* <FormFieldCustom
        title={"Chủ cửa hàng"}
        value={form.email}
        placeholder={"Tên chủ tài khoản..."}
        handleChangeText={(e) => setForm({ ...form, email: e })}
        keyboardType="email-address"
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
      /> */}
      <FormFieldCustom
        title={"Email"}
        value={form.email}
        placeholder={"Nhập địa chỉ email..."}
        handleChangeText={(e) => setForm({ ...form, email: e })}
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-14 border-gray-100"
      />

      <CustomButton
        title="Cập nhật email"
        handlePress={() => {
          setStep(1);
        }}
        // iconRight={
        //   <Ionicons name="arrow-forward-outline" size={22} color="white" />
        // }
        containerStyleClasses="bg-primary w-full mt-3 h-12"
        textStyleClasses="text-white mr-2"
        isLoading={isSubmitting}
      />
      <CustomButton
        title="Thay đổi mật khẩu"
        handlePress={() => {
          setStep(0);
        }}
        // iconLeft={<Ionicons name="arrow-back-outline" size={22} color="gray" />}
        containerStyleClasses="w-full mt-2 bg-white border-gray-500 border-2 h-12"
        textStyleClasses="ml-2 text-gray-600"
        isLoading={isSubmitting}
      />
    </View>
  );
};

export default ShopProfileChange;
