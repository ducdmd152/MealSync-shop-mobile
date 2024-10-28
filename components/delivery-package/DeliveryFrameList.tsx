import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import CustomButton from "../custom/CustomButton";
import { ScrollView } from "react-native-gesture-handler";
import utilService from "@/services/util-service";

const DeliveryFrameList = ({ beforeGo }: { beforeGo: () => void }) => {
  return (
    <View className="w-full h-full bg-white text-black  relative">
      <View className="absolute w-full items-center justify-center bottom-28 left-0 z-10">
        <CustomButton
          title="Tạo mới"
          handlePress={() => {}}
          containerStyleClasses="w-[98%] h-[50px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
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

        <View className="gap-y-2 pb-[250px]">
          {/* {isLoading && (
            <ActivityIndicator animating={isLoading} color="#FCF450" />
          )} */}
          {Array.from({ length: 5 }).map((_, index) => (
            <TouchableOpacity className="p-3 drop-shadow-md rounded-lg shadow border-[0.5px] border-gray-200">
              <View className="flex-row">
                <Text className="font-psemibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
                  {utilService.formatTime(600) +
                    " - " +
                    utilService.formatTime(630)}
                </Text>
                <Text className="ml-2 bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
                  {utilService.formatDate("2024/10/28")}
                </Text>
              </View>

              <View key={index} className="gap-y-2 mt-2 ml-1">
                <Text>Văn Hoàng - 12 đơn (4A, 5B)</Text>
                <Text>Xuân Minh - 12 đơn (6A, 4B)</Text>
                <Text>Xuân Minh - 12 đơn (7A, 5B)</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default DeliveryFrameList;
