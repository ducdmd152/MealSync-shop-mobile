import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
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
} from "react-native";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAcceptedPolicy, setIsAcceptedPolicy] = useState(false);
  const [selectedDormitories, setSelectedDormitories] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
    phoneNumber: "",
    address: "",
  });

  const dormitories: { id: number; name: string }[] = [
    { id: 1, name: "Khu A" },
    { id: 2, name: "Khu B" },
    // Thêm các khu khác nếu cần
  ];

  const onSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert(
        "Thông báo",
        `Vui lòng điền đầy đủ thông tin${
          selectedDormitories.length === 0 ? " và chọn khu" : ""
        }!`
      );
      return;
    }
    if (selectedDormitories.length === 0) {
      Alert.alert("Thông báo", `Vui lòng chọn khu vực bán!`);
      return;
    }

    const requestData = {
      email: form.email,
      fullName: form.name,
      phoneNumber: form.phoneNumber,
      gender: 1, // Hoặc lấy từ một trường chọn khác
      password: form.password,
      shopName: form.shopName,
      dormitoryIds: selectedDormitories,
      address: form.address,
      latitude: 0.1, // Hoặc lấy từ trường địa chỉ
      longitude: 0.1, // Hoặc lấy từ trường địa chỉ
    };

    setIsSubmitting(true);
    try {
      // Gọi API để gửi dữ liệu
      // const result = await apiClient.post("auth/register", requestData);
      setStep(2); // Chuyển sang bước xác minh
      // router.replace("/home");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepOne = () => (
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
        handlePress={() => setStep(1)}
        iconRight={
          <Ionicons name="arrow-forward-outline" size={22} color="white" />
        }
        containerStyleClasses="bg-primary w-full mt-3"
        textStyleClasses="text-white mr-2"
        isLoading={isSubmitting}
      />
    </View>
  );

  const renderStepTwo = () => (
    <View className="w-full">
      <FormFieldCustom
        title={"Tên cửa hàng"}
        value={form.shopName}
        placeholder={"Nhập tên cửa hàng..."}
        handleChangeText={(e) => setForm({ ...form, shopName: e })}
        keyboardType="default"
        otherStyleClasses="mt-3"
      />
      <FormFieldCustom
        title={"Số điện thoại"}
        value={form.phoneNumber}
        placeholder={"Nhập số điện thoại..."}
        handleChangeText={(e) => setForm({ ...form, phoneNumber: e })}
        keyboardType="phone-pad"
        otherStyleClasses="mt-3"
      />
      <FormFieldCustom
        title={"Địa chỉ cửa hàng"}
        value={form.address}
        placeholder={"Nhập địa chỉ cửa hàng..."}
        handleChangeText={(e) => setForm({ ...form, address: e })}
        otherStyleClasses="mt-3"
      />
      <Text className="text-base text-gray-500 font-pmedium mt-3">
        Khu bán hàng
      </Text>
      <View className="flex-row items-center mt-1">
        {dormitories.map((dormitory) => (
          <CustomCheckbox
            key={dormitory.id}
            isChecked={selectedDormitories.includes(dormitory.id)}
            handlePress={() => {
              setSelectedDormitories((prev) =>
                prev.includes(dormitory.id)
                  ? prev.filter((id) => id !== dormitory.id)
                  : [...prev, dormitory.id]
              );
            }}
            label={<Text className="text-[16px]">{dormitory.name}</Text>}
            containerStyleClasses={"w-[100px]"}
          />
        ))}
      </View>
      <View className="border-b-[.7px] border-gray-100 mt-3" />
      <CustomCheckbox
        isChecked={isAcceptedPolicy}
        handlePress={() => setIsAcceptedPolicy(!isAcceptedPolicy)}
        containerStyleClasses="mt-3"
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
        handlePress={() => onSubmit()}
        iconRight={<Text className="text-primary">{" --->"}</Text>}
        containerStyleClasses="w-full mt-3 bg-primary"
        textStyleClasses="text-white"
        isLoading={isSubmitting}
        isDisabled={!isAcceptedPolicy}
      />
      <CustomButton
        title="Quay trở lại"
        handlePress={() => setStep(0)}
        iconLeft={<Ionicons name="arrow-back-outline" size={22} color="gray" />}
        containerStyleClasses="w-full mt-4 bg-white border-gray-500 border-2"
        textStyleClasses="ml-2 text-gray-600"
        isLoading={isSubmitting}
      />
    </View>
  );

  return (
    <PageLayoutWrapper>
      <View className="w-full min-h-full justify-center items-center px-4 shink-0">
        <Image
          source={images.signInLogo1}
          resizeMode="contain"
          className="h-[60px]"
        />
        <Text className="text-2xl text-gray text-semibold mt-2 font-psemibold">
          Đăng ký
        </Text>
        <Text className="text-[12.8px] text-gray italic mt-1">
          Vui lòng điền đầy đủ các trường thông tin
        </Text>

        {step === 2 ? (
          <SignUpVerification />
        ) : step === 0 ? (
          renderStepOne() // Gọi hàm để render bước đầu tiên
        ) : (
          renderStepTwo() // Gọi hàm để render bước thứ hai
        )}

        {step !== 2 && (
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
    </PageLayoutWrapper>
  );
};

export default SignUp;
