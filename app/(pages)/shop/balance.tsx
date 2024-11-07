import { View, Text, ImageBackground, StyleSheet } from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import utilService from "@/services/util-service";
import { TextInput } from "react-native-gesture-handler";
import CONSTANTS from "@/constants/data";

const Balance = () => {
  return (
    <PageLayoutWrapper>
      <View className="flex-1 p-2 w-full">
        <ImageBackground
          source={{ uri: CONSTANTS.url.balanceBackgroundImage }} // Đường dẫn đến hình nền
          style={{ ...styles.backgroundImage }} // Gán style cho ImageBackground để phủ toàn bộ màn hình
          resizeMode="cover" // Đảm bảo hình nền bao phủ toàn bộ
        >
          <View className="flex-1 w-full bg-gray-000 flex-col items-center justify-center p-4 py-10 pb-5 backdrop-blur-lg bg-white/3 rounded-lg">
            <View>
              <Text className="text-center mb-2 text-gray-500 mr-1">
                Tổng số dư
              </Text>
              <View className="justify-center items-end gap-x-2 flex-row flex-col gap-0 items-center ">
                <Text className="font-semibold text-[42px] text-[#fbbf24] ">
                  {utilService.formatPrice(10000000)}
                </Text>
                <Text className="text-[15px] text-[#fbbf24] mb-3 font-semibold">
                  VND
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
        <View className="bg-opacity-10 mt-2 rounded-lg overflow-hidden">
          <ImageBackground
            source={{ uri: CONSTANTS.url.balanceDetailBackgroundImage }} // Đường dẫn đến hình nền
            style={{ ...styles.backgroundImage, alignItems: "flex-start" }} // Gán style cho ImageBackground để phủ toàn bộ màn hình
            resizeMode="cover" // Đảm bảo hình nền bao phủ toàn bộ
          >
            <View className="w-full py-4 mt-2 pt-6 backdrop-blur-xl  ">
              {/* <View className="mb-2 relative">
            <Text className="absolute text-[12.8px]  top-[-4px] left-2 px-1 bg-white/3 z-10 italic backdrop-blur-md text-gray-500 text-[13.5px] text-gray-500 text-[13.5px]">
              Có sẵn
            </Text>
            <TextInput
              className="border-0 border-gray-200 mt-1 px-3 pt-3 rounded pb-3 font-semibold text-[#fcd34d] text-[18px] "
              value={utilService.formatPrice(200_000) + "₫"}
              onChangeText={(text) => {}}
              keyboardType="numeric"
              readOnly
              placeholderTextColor="#888"
            />
            <Text className="absolute right-3 top-5 text-[12.8px] italic">
              đ
            </Text>
          </View> */}
              <View className="w-full flex-row gap-x-[2px] items-center">
                <View className="mb-2 relative">
                  <Text className="absolute text-[12.8px]  top-[-4px] left-2 px-1 bg-white/3 z-10 italic backdrop-blur-md text-gray-500 text-[13.5px] text-gray-500 text-[13.5px]">
                    Có sẵn
                  </Text>
                  <TextInput
                    className="border-0 border-gray-200 mt-1 px-3 pt-3 font-semibold text-[#fcd34d] text-[18px] "
                    value={utilService.formatPrice(200_000_000) + "₫"}
                    onChangeText={(text) => {}}
                    keyboardType="numeric"
                    readOnly
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-3 top-5 text-[12.8px] italic">
                    {/* đ */}
                  </Text>
                </View>
                <View className=" mb-2 relative">
                  <Text className="absolute text-[12.8px]  top-[-4px] left-2 px-1 bg-white/2 z-10 italic backdrop-blur-md text-gray-500 text-[13.5px] text-gray-500 text-[13.5px]">
                    Đang chờ về
                  </Text>
                  <TextInput
                    className="border-0 border-gray-200 mt-1 px-3 pt-3 font-semibold text-[#fcd34d] text-[18px]"
                    value={utilService.formatPrice(200_000) + "₫"}
                    onChangeText={(text) => {}}
                    keyboardType="numeric"
                    readOnly
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-3 top-4 text-[12.8px] italic">
                    {/* đ */}
                  </Text>
                </View>
                <View className="mb-2 relative">
                  <Text className="absolute text-[12.8px]  top-[-4px] left-2 px-1 bg-white/2 z-10 italic backdrop-blur-md text-gray-500 text-[13.5px] text-gray-500 text-[13.5px] rounded-md">
                    Báo cáo
                  </Text>
                  <TextInput
                    className="border-0 border-gray-200 mt-1 px-3 pt-3 font-semibold text-[#fcd34d] text-[18px]"
                    value={utilService.formatPrice(200_000)}
                    onChangeText={(text) => {}}
                    keyboardType="numeric"
                    readOnly
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-3 top-4 text-[12.8px] italic">
                    {/* đ */}
                  </Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default Balance;

const styles = StyleSheet.create({
  backgroundImage: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 20,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
