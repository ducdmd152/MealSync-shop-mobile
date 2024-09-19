import { View, Text, Image, Touchable, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { images } from "@/constants";
import { router } from "expo-router";

const TabHeader = () => {
  return (
    <View className="w-full h-[64px] px-4 bg-white flex-row justify-between border-b-[0.2px] border-gray-200 overflow-hidden">
      <View className="flex-row justify-center items-center">
        {/* <View className="flex-row justify-center items-center">
          <Ionicons name="menu-outline" size={36} color="#DF4830" />
        </View> */}
        {/* <Image
          source={images.logoText}
          className="h-[28px] ml-[-68px] mt-[2px]"
          resizeMode="contain"
        /> */}
        <Image
          source={images.logoText}
          className="h-[32px] ml-[-68px] mt-[6px]"
          resizeMode="contain"
        />
        {/* <Image
          source={images.logoTextPlusSquare}
          className="h-[31px] ml-[-88px] mt-[8px]"
          resizeMode="contain"
        /> */}
      </View>
      <View className="flex-row justify-center items-center gap-2">
        <TouchableOpacity
          onPress={() => router.push("/notification")}
          className="flex-row justify-center items-center"
        >
          <Ionicons name="notifications-outline" size={32} color="#DF4830" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/chatting")}
          className="flex-row justify-center items-center"
        >
          <Ionicons name="chatbubbles-outline" size={32} color="#DF4830" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TabHeader;
