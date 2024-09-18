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
        <ImageBackground
          source={{ uri: images.welcomeBg }}
          resizeMode="cover"
          className="w-full h-full justify-center items-center"
        >
          <View className="w-full justify-center items-center h-full px-4">
            <Image
              source={images.welcomeLogo}
              className="w-[240px] h-[200px]"
              resizeMode="contain"
            />
            {/* <Image
              source={images.cards}
              className="max-w-[380px] w-full h-[280px]"
              resizeMode="contain"
            /> */}
            <Text className="text-[17px] text-gray-400 font-bold text-center">
              Ứng dụng đặt đồ ăn theo giờ
              {"\n"}
              khu vực ký túc xá ĐHQG
            </Text>
            <Text className="text-gray-300 mt-7 text-center">
              Phiên bản dành cho cửa hàng
            </Text>

            <View className="w-full justify-end items-center mt-3">
              <CustomButton
                title="Đăng nhập"
                handlePress={() => {
                  router.push("/sign-in");
                }}
                containerStyleClasses="w-full mt-4 bg-primary"
                textStyleClasses="text-white"
              />
              <CustomButton
                title="Đăng ký"
                handlePress={() => {
                  router.push("/sign-up");
                }}
                containerStyleClasses="w-full mt-4 bg-white border-gray-600 border-2"
                textStyleClasses="text-gray-600"
              />
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}
