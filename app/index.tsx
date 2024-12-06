import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import {
  Image,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  ImageBackground,
} from "react-native";
import { images } from "@/constants";
import CustomButton from "@/components/custom/CustomButton";

export default function HomeScreen() {
  return (
    <SafeAreaView className="bg-white text-white h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full justify-center items-center h-full px-4">
          <View className="flex-1 w-full justify-center items-center mt-12">
            <Image
              source={images.welcomeLogo}
              className="ml-2 w-[240px] h-[200px]"
              resizeMode="contain"
            />
            <Text className="text-[16px] text-gray-400 font-bold text-center">
              Ứng dụng đặt đồ ăn theo giờ
              {"\n"}
              khu vực ký túc xá ĐHQG
            </Text>
          </View>

          <View className="w-full justify-end items-center mt-2 mb-20">
            <Text className="text-gray-300 mt-7 text-center ">
              Phiên bản dành cho cửa hàng
            </Text>
            <CustomButton
              title="Đăng nhập"
              handlePress={() => {
                router.replace("/sign-in");
              }}
              containerStyleClasses="w-full mt-4 bg-primary"
              textStyleClasses="text-white"
            />
            <CustomButton
              title="Đăng ký"
              handlePress={() => {
                router.replace("/sign-up");
              }}
              containerStyleClasses="w-full mt-4 bg-white border-gray-600 border-2"
              textStyleClasses="text-gray-600"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
