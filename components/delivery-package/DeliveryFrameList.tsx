import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import CustomButton from "../custom/CustomButton";
import { ScrollView } from "react-native-gesture-handler";
import utilService from "@/services/util-service";
import { Ionicons } from "@expo/vector-icons";

const DeliveryFrameList = ({ beforeGo }: { beforeGo: () => void }) => {
  return (
    <View className="w-full flex-1 bg-white text-black relative">
      <View className="absolute w-full items-end justify-center bottom-12 right-2 z-10">
        <CustomButton
          title="Tạo mới"
          handlePress={() => {}}
          containerStyleClasses="h-[36px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10"
          iconLeft={
            <Ionicons name="add-circle-outline" size={21} color="white" />
          }
          textStyleClasses="text-[15px] text-gray-900 ml-1 text-white"
        />
      </View>

      <View className="w-full gap-2 p-4 pt-3">
        <View className="w-full">
          {/* <Searchbar
            style={{
              height: 40,
              // backgroundColor: "white",
              // borderColor: "lightgray",
              // borderWidth: 2,
            }}
            inputStyle={{ minHeight: 0 }}
            placeholder="Nhập tên món..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          /> */}
        </View>

        <ScrollView className="gap-y-2 pb-[250px]">
          {/* {isLoading && (
            <ActivityIndicator animating={isLoading} color="#FCF450" />
          )} */}
          {Array.from({ length: 5 }).map((_, index) => (
            <TouchableOpacity className="p-3 drop-shadow-md rounded-lg shadow border-[0.5px] border-gray-200">
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-center">
                  <Text className="text-[12px] font-psemibold bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100">
                    GPKG-{123 + index}
                  </Text>
                </View>
                <View className="flex-row">
                  <Text className="font-psemibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
                    {utilService.formatTime(600) +
                      " - " +
                      utilService.formatTime(630)}
                  </Text>
                  <Text className="ml-2 bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
                    {utilService.formatDateDdMmYyyy("2024/10/28")}
                  </Text>
                </View>
              </View>

              <View key={index} className="gap-y-2 mt-2 ml-1">
                <Text className="text-[11.5px] text-gray-700 font-semibold">
                  Văn Hoàng - 12 đơn (4A, 5B) - Hoàn tất 11/12
                </Text>
                <Text className="text-[11.5px] text-gray-700 font-semibold">
                  Xuân Minh - 10 đơn (6A, 4B) - Hoàn tất 9/10
                </Text>
                <Text className="text-[11.5px] text-gray-700 font-semibold">
                  Xuân Anh - 12 đơn (7A, 5B) - Hoàn tất 12/12
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default DeliveryFrameList;
