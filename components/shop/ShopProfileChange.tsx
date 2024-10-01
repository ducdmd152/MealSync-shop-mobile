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
      <FormFieldCustom
        title={"Tên cửa hàng"}
        value={form.name}
        placeholder={"Nhập tên cửa hàng..."}
        handleChangeText={(e) => setForm({ ...form, name: e })}
        keyboardType="default"
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
      />

      <FormFieldCustom
        title={"Địa chỉ cửa hàng"}
        value={form.password}
        readOnly
        placeholder={"Chọn địa chỉ cửa hàng..."}
        handleChangeText={(e) => setForm({ ...form, password: e })}
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
        iconRight={
          <TouchableOpacity className="h-[32px] w-[32px] bg-primary rounded-md justify-center items-center relative">
            <Ionicons name="location-outline" size={28} color="white" />
          </TouchableOpacity>
        }
      />
      <View className={`gap-y-0 mt-3`}>
        <Text className="text-base text-gray-500 font-pmedium">
          Khu vực bán hàng
        </Text>
        <View className="flex-row gap-x-8 ml-[2px]">
          <CustomCheckbox
            isChecked={hasA}
            handlePress={() => setHasA(!hasA)}
            label={<Text className="text-[16px]">Khu A</Text>}
            containerStyleClasses={"w-[100px]"}
          />
          <CustomCheckbox
            isChecked={hasB}
            handlePress={() => setHasB(!hasB)}
            label={<Text className="text-[16px]">Khu B</Text>}
            containerStyleClasses={"w-[100px]"}
          />
        </View>
      </View>

      <FormFieldCustom
        title={"Số điện thoại"}
        value={form.email}
        placeholder={"Nhập số điện thoại..."}
        handleChangeText={(e) => setForm({ ...form, email: e })}
        keyboardType="email-address"
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
      />

      <FormFieldCustom
        title={"Chủ cửa hàng"}
        value={form.name}
        placeholder={"Nhập tên chủ cửa hàng..."}
        handleChangeText={(e) => setForm({ ...form, name: e })}
        keyboardType="default"
        otherStyleClasses="mt-2"
        otherInputStyleClasses="h-12 border-gray-100"
      />
    </View>
  );
};

export default ShopProfileChange;
