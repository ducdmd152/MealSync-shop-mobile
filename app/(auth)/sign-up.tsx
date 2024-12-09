import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import CustomButton from "@/components/custom/CustomButton";
import CustomCheckbox from "@/components/custom/CustomCheckbox";
import FormFieldCustom from "@/components/custom/FormFieldCustom";
import SampleCustomCheckbox from "@/components/custom/SampleCustomCheckbox";
import SignUpVerification from "@/components/sign-up/SignUpVerification";
import { images } from "@/constants";
import CONSTANTS from "@/constants/data";
import useMapLocationState from "@/hooks/states/useMapLocationState";
import apiClient from "@/services/api-services/api-client";
import sessionService from "@/services/session-service";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  const location = useMapLocationState();
  console.log("location: ", location);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    setForm({ ...form, address: location.address });
  }, [location]);

  const dormitories = [
    { id: 1, name: "Khu A" },
    { id: 2, name: "Khu B" },
  ];

  const validateEmail = (email: string) => {
    const emailRegex = CONSTANTS.REGEX.email;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = CONSTANTS.REGEX.password;
    return passwordRegex.test(password);
  };
  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = CONSTANTS.REGEX.phone;
    return phoneRegex.test(phoneNumber);
  };

  const onSubmit = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.shopName ||
      !form.phoneNumber
    ) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (form.shopName.length < 8) {
      Alert.alert("Thông báo", "Tên cửa hàng phải có ít nhất 8 ký tự.");
      return;
    }

    if (!validatePhoneNumber(form.phoneNumber)) {
      Alert.alert("Thông báo", "Số điện thoại không hợp lệ.");
      return;
    }

    if (location.id < 0) {
      Alert.alert("Thông báo", "Vui lòng chọn địa chỉ của cửa hàng!");
      return;
    }
    if (selectedDormitories.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn khu vực bán!");
      return;
    }

    const requestData = {
      email: form.email,
      fullName: form.name,
      phoneNumber: form.phoneNumber,
      gender: 1,
      password: form.password,
      shopName: form.shopName,
      dormitoryIds: selectedDormitories,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    setIsSubmitting(true);
    try {
      // Gọi API để gửi dữ liệu
      console.log("Sign Up: ", requestData);
      const result = await apiClient.post("auth/shop-register", requestData);
      sessionService.setAuthEmail(result.data?.value?.email), setStep(2); // to verify code
      // router.replace("/home");
    } catch (error: any) {
      console.log(error, error.response);
      Alert.alert(
        "Lỗi đăng ký!",
        error?.response?.data?.error?.message || "Lỗi mất rồi!"
      );
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
        handleChangeText={(e) => setForm({ ...form, email: e.trim() })}
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
        value={form.confirmPassword}
        placeholder={"Xác nhận mật khẩu..."}
        handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
        isPassword={true}
        otherStyleClasses="mt-3"
      />
      <CustomButton
        title="Tiếp tục"
        handlePress={() => {
          if (
            !form.name ||
            !form.email ||
            !form.password ||
            !form.confirmPassword
          ) {
            Alert.alert("Thông báo", `Vui lòng điền đầy đủ thông tin!`);
            return;
          }
          if (form.name.length < 6) {
            Alert.alert(
              "Thông báo",
              "Tên chủ cửa hàng phải có ít nhất 6 ký tự."
            );
            return;
          }

          if (!validateEmail(form.email)) {
            Alert.alert("Thông báo", "Email không hợp lệ.");
            return;
          }
          if (!validatePassword(form.password)) {
            Alert.alert(
              "Thông báo",
              "Mật khẩu phải có ít nhất 8 kí tự, 1 chữ hoa, 1 chữ thường, 1 ký tự đặc biệt và 1 số."
            );
            return;
          }

          if (form.password !== form.confirmPassword) {
            Alert.alert("Thông báo", "Mật khẩu không trùng khớp.");
            return;
          }
          setStep(1);
        }}
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
        selection={{ start: 0, end: 0 }}
        scrollEnabled={true} // Bật cuộn ngang
        multiline={false} // Văn bản chỉ nằm trên 1 dòng
        textAlign="left" // Căn trái
        value={location.id < 0 ? "" : location.address}
        readOnly={true}
        placeholder={"Chọn địa chỉ cửa hàng..."}
        handleChangeText={(text) => {}}
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
        // className="mb-1"
        iconRight={
          <View className="pl-2">
            <TouchableOpacity
              onPress={() => {
                router.push("/map");
              }}
              className="h-[32px] w-[32px] bg-primary rounded-md justify-center items-center relative"
            >
              <Ionicons name="location-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        }
      />
      <Text className="text-base text-gray-500 font-medium mt-3">
        Khu bán hàng
      </Text>
      <View className="flex-row items-center mt-1">
        {dormitories.map((dormitory) => (
          <SampleCustomCheckbox
            key={dormitory.id}
            checked={selectedDormitories.includes(dormitory.id)}
            onToggle={() => {
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
            trên hệ thống mealsync
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
      {/* Other components */}
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      if (step == 0) {
        location.setId(-1);
        location.setLocation("", 0.1, 0.1);
      }
    }, [])
  );
  return (
    <PageLayoutWrapper>
      <View className="w-full min-h-full justify-center items-center px-4 shink-0">
        <Image
          source={images.signInLogo1}
          resizeMode="contain"
          className="h-[60px]"
        />
        <Text className="text-2xl text-gray text-semibold mt-2 font-semibold">
          Đăng ký
        </Text>
        {step != 2 && (
          <Text className="text-[12.8px] text-gray italic mt-1">
            Vui lòng điền đầy đủ các trường thông tin
          </Text>
        )}

        {step === 2 ? (
          <SignUpVerification />
        ) : step === 0 ? (
          renderStepOne()
        ) : (
          renderStepTwo()
        )}

        {step !== 2 && (
          <View className="justify-center pt-5 gap-2">
            <Text className="text-lg text-gray-100 font-regular text-center">
              Bạn đã có tài khoản?{" "}
              <Link
                href="/sign-in"
                className="text-white text-primary font-semibold"
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
