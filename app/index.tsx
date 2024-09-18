import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { Image, Text, View, SafeAreaView, ScrollView } from "react-native";
import { images } from "@/constants";
import CustomButton from "@/components/custom/CustomButton";

export default function HomeScreen() {
  return (
    <SafeAreaView className="bg-primary text-white h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full justify-center items-center h-full px-4">
          <Image
            source={images.logo}
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          />
          <Image
            source={images.cards}
            className="max-w-[380px] w-full h-[280px]"
            resizeMode="contain"
          />
          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">
              Discover Endless Possibilities{" "}
              <Text className="text-secondary-200">Aora</Text>
            </Text>
            <Image
              source={images.path}
              className="absolute -bottom-2 -right-8 w-[132px] h-[15px]"
              resizeMode="contain"
            />
          </View>
          <Text className="text-gray-100 mt-7 text-center">
            Where creativity meets innovation: embark on a journey of limitless
          </Text>

          <CustomButton
            title="Continue with Email"
            handlePress={() => {
              router.push("/sign-in");
            }}
            containerStyleClasses="w-full mt-4"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
