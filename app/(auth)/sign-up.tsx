import CustomButton from "@/components/custom/CustomButton";
import FormFieldCustom from "@/components/custom/FormFieldCustom";
import { images } from "@/constants";
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
} from "react-native";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const onSubmit = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields!");
    }
    setIsSubmitting(true);
    try {
      // const result = await createUser(form.username, form.email, form.password);
      // set it to global state

      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong!");
    }
    setIsSubmitting(false);
  };
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full h-full justify-center items-center px-4 mt-12">
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[115px] h-[35px]"
          />
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">
            Sign up to Aora
          </Text>
          <FormFieldCustom
            title={"Username"}
            value={form.username}
            placeholder={"Enter your username..."}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            keyboardType="default"
            otherStyleClasses="mt-7"
          />
          <FormFieldCustom
            title={"Email"}
            value={form.email}
            placeholder={"Enter your email..."}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            keyboardType="email-address"
            otherStyleClasses="mt-7"
          />

          <FormFieldCustom
            title={"Password"}
            value={form.password}
            placeholder={"Enter your password..."}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            isPassword={true}
            otherStyleClasses="mt-7"
          />
          <CustomButton
            title="Sign Up"
            handlePress={() => {
              onSubmit();
            }}
            containerStyleClasses="w-full mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 gap-2">
            <Text className="text-lg text-gray-100 font-regular text-center">
              Already have account?{" "}
              <Link
                href="/sign-in"
                className="text-white text-secondary font-psemibold"
              >
                Sign In
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
