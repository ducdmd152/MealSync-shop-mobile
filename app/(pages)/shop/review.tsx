import { View, Text, Touchable, TouchableOpacity } from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, ProgressBar } from "react-native-paper";
import CONSTANTS from "@/constants/data";
import { Rating } from "react-native-elements";
import CustomButton from "@/components/custom/CustomButton";

const Review = () => {
  return (
    <PageLayoutWrapper>
      <View className="p-4">
        <View className="py-2 bg-[#ecfdf5] grow-0 rounded-[12px]">
          <View className="flex-row p-2 items-center gap-x-2 px-4">
            <Text className="text-lg font-bold">4.1</Text>
            <Ionicons name="star" size={21} color="#fde047" />
            <Text className="text-sm text-gray-700 ml-[8px]">150 đánh giá</Text>
          </View>
          <View className="h-[2px] bg-white"></View>
          <View className="p-3 px-4">
            <View className="flex-row gap-2 items-center">
              <Text className="text-gray-600">5</Text>
              <View className="flex-1">
                <ProgressBar
                  progress={0.6}
                  color={"#fde047"}
                  style={{ backgroundColor: "#e5e5e5" }}
                />
              </View>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-gray-600">4</Text>
              <View className="flex-1">
                <ProgressBar
                  progress={0.2}
                  color={"#fde047"}
                  style={{ backgroundColor: "#e5e5e5" }}
                />
              </View>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-gray-600">3</Text>
              <View className="flex-1">
                <ProgressBar
                  progress={0.08}
                  color={"#fde047"}
                  style={{ backgroundColor: "#e5e5e5" }}
                />
              </View>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-gray-600">2</Text>
              <View className="flex-1">
                <ProgressBar
                  progress={0.07}
                  color={"#fde047"}
                  style={{ backgroundColor: "#e5e5e5" }}
                />
              </View>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-gray-600">1</Text>
              <View className="flex-1">
                <ProgressBar
                  progress={0.05}
                  color={"#fde047"}
                  style={{ backgroundColor: "#e5e5e5" }}
                />
              </View>
            </View>
          </View>
        </View>
        <View className="gap-y-[4px] mt-3">
          {Array.from({ length: 5 }, (_, i) => (
            <View className="p-4 py-1" key={i}>
              <View className="mt-2 flex-row items-center justify-between">
                <View className="flex-row gap-x-4 items-center">
                  <View className="w-[36px] justify-center items-center border-[1px] border-green-200 rounded-full">
                    <Avatar.Image
                      size={36}
                      source={{
                        uri: CONSTANTS.url.userAvatarDefault,
                      }}
                    />
                  </View>
                  <Text className="text-gray-800">Duy Đức</Text>
                </View>
              </View>

              <View className="flex-row justify-start items-center ml-[2px] mt-2 gap-x-2">
                <Rating
                  showRating={false}
                  readonly={true}
                  count={5}
                  onFinishRating={5}
                  startingValue={4.5}
                  imageSize={14}
                />
                <Text className="font-bold">&#183;</Text>
                <Text className="text-gray-600 text-[12px]">19 ngày trước</Text>
              </View>
              <Text className="mt-2 text-gray-800">
                Trà sữa cũm ok, cũm ngon.
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500 text-[12px]">
                  Đã đặt: Trà Olong, Bánh cake,...
                </Text>
                <CustomButton
                  title="Chi tiết"
                  handlePress={() => {}}
                  iconRight={
                    <Ionicons
                      name="arrow-forward-outline"
                      size={16}
                      color="#3b82f6"
                    />
                  }
                  containerStyleClasses="w-fit bg-white"
                  textStyleClasses="ml-2 text-[#3b82f6] text-[12px]"
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default Review;
