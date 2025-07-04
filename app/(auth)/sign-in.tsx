import { useFormik } from "formik";
import * as Yup from "yup";
import CustomButton from "@/components/custom/CustomButton";
import FormFieldCustom from "@/components/custom/FormFieldCustom";
import { images } from "@/constants";
import { Link, router, useFocusEffect, useNavigation } from "expo-router";
import React, { useState } from "react";
import { Image, SafeAreaView, ScrollView, Text, View } from "react-native";
import apiClient from "@/services/api-services/api-client";
import sessionService from "@/services/session-service";
import { CommonActions } from "@react-navigation/native";
import utilService from "@/services/util-service";
import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
import AuthDTO from "@/types/dtos/AuthDTO";
import useMapLocationState from "@/hooks/states/useMapLocationState";

interface FormValues {
  email: string;
  password: string;
}

const SignIn = () => {
  const navigation = useNavigation();
  const globalAuthState = useGlobalAuthState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const location = useMapLocationState();

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Vui lòng nhập email không hợp lệ!"
        )
        .required("Vui lòng nhập email!"),
      password: Yup.string()
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .required("Vui lòng nhập mật khẩu!"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setServerError(null); // Reset error before making API call
      try {
        const response = await apiClient.post("auth/login", {
          loginContext: 2,
          ...values,
        });
        const token = response.data?.value?.tokenResponse?.accessToken || "";
        // console.log(response.data);
        const roleId =
          response.data?.value?.accountResponse?.roleName == "ShopOwner"
            ? 2
            : 3;
        const authDTO = response.data?.value?.accountResponse
          ? (response.data?.value?.accountResponse as AuthDTO)
          : null;
        sessionService.setAuthToken(
          response.data?.value?.tokenResponse?.accessToken || ""
        );
        sessionService.setAuthRole(roleId);
        if (authDTO) sessionService.setAuthDTO(authDTO);
        globalAuthState.setToken(token);
        globalAuthState.setRoleId(roleId);
        globalAuthState.setAuthDTO(authDTO);

        // console.log("roleId: ", token, roleId);
        if (roleId == 2) {
          router.replace("/home");
        } else router.replace("/staff-home");
        // console.log(await sessionService.getAuthToken());
        // navigation.dispatch(
        //   CommonActions.reset({
        //     index: 0,
        //     routes: [{ name: "home" }],
        //   })
        // );
      } catch (error: any) {
        // console.log(error);
        if (error.response && error.response.status === 403) {
          setServerError("Email hoặc mật khẩu không đúng");
        } else {
          setServerError(
            error?.response?.data?.error?.message ||
              "Hệ thống đang bảo trì, vui lòng thử lại sau!"
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      formik.resetForm();
    }, [])
  );

  return (
    <SafeAreaView className="h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full h-full justify-center items-center px-4">
          <Image
            source={images.signInLogo1}
            resizeMode="contain"
            className="h-[80px]"
          />
          <Text className="text-2xl text-gray text-semibold mt-10 font-semibold">
            Đăng nhập
          </Text>

          <FormFieldCustom
            title={"Email"}
            value={formik.values.email}
            placeholder={"Nhập email của bạn..."}
            handleChangeText={(e) => {
              formik.setFieldValue("email", e);
              setServerError(null);
            }}
            keyboardType="email-address"
            otherStyleClasses="mt-7"
          />
          {(formik.touched.email && formik.errors.email
            ? formik.errors.email
            : "") && (
            <Text className="text-red-500 mt-2 text-left w-full italic">
              {formik.touched.email && formik.errors.email
                ? formik.errors.email
                : ""}
            </Text>
          )}

          <FormFieldCustom
            title={"Mật khẩu"}
            value={formik.values.password}
            placeholder={"Nhập mật khẩu..."}
            handleChangeText={(e) => {
              formik.setFieldValue("password", e);
              setServerError(null);
            }}
            isPassword={true}
            otherStyleClasses="mt-5"
          />

          {(formik.touched.password && formik.errors.password
            ? formik.errors.password
            : "") && (
            <Text className="text-red-500 mt-2 text-left w-full italic">
              {formik.touched.password && formik.errors.password
                ? formik.errors.password
                : ""}
            </Text>
          )}

          {!(formik.touched.password && formik.errors.password
            ? formik.errors.password
            : "") &&
            !(formik.touched.email && formik.errors.email
              ? formik.errors.email
              : "") &&
            serverError && (
              <Text className="text-red-500 text-center mt-3 font-semibold">
                {serverError}
              </Text>
            )}

          <CustomButton
            title="Đăng nhập"
            handlePress={() => formik.handleSubmit()}
            containerStyleClasses="bg-primary w-full mt-7"
            textStyleClasses="text-white"
            isLoading={isSubmitting}
          />

          <View className="w-full justify-center items-center mt-4">
            <Text className="text-lg text-black font-regular text-right pr-2">
              <Link
                href="/forget-password"
                className="text-white text-primary text-[14px]"
              >
                Bạn quên mật khẩu?
              </Link>
            </Text>
          </View>

          <View className="justify-center items-center pt-2 gap-2 mt-2">
            <Text className="text-lg text-black font-regular text-center">
              Bạn chưa có tài khoản?{" "}
              <Text
                onPress={() => {
                  location.setId(-1);
                  location.setLocation("", 0.1, 0.1);
                  router.replace("/sign-up");
                }}
                className="text-white text-primary font-semibold"
              >
                Đăng ký
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
