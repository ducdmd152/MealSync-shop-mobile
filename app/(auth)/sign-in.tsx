import CustomButton from "@/components/custom/CustomButton";
import FormFieldCustom from "@/components/custom/FormFieldCustom";
import FormField from "@/components/custom/FormFieldCustom";
import { images } from "@/constants";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
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
            Log in to Aora
          </Text>
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
            title="Sign In"
            handlePress={() => {}}
            containerStyleClasses="w-full mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 gap-2">
            <Text className="text-lg text-gray-100 font-regular text-center">
              Don't have account?{" "}
              <Link
                href="/sign-up"
                className="text-white text-secondary font-psemibold"
              >
                Sign Up
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
