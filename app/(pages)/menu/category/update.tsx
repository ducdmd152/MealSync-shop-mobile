import { View, Text, Image } from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import { CRUD } from "@/constants/operations";
import { router } from "expo-router";
import FormField from "@/components/custom/FormFieldCustom";
import CustomButton from "@/components/custom/CustomButton";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

const CategoryUpdate = () => {
  return (
    <PageLayoutWrapper isScroll={false}>
      <View className="flex-1 p-4 justify-between">
        <View>
          <FormField
            title="Tên danh mục"
            value=""
            placeholder="Nhập tên danh mục..."
            handleChangeText={(text) => {}}
            otherStyleClasses=""
            otherInputStyleClasses="border-gray-300 h-14"
          />
          <Text className="text-md text-gray-700 italic mt-3 pb-1">
            10 sản phẩm thuộc danh mục này
          </Text>
          <ScrollView style={{ width: "100%", height: "60%" }}>
            <View className="gap-y-2 mt-2">
              {Array.from({ length: 10 }, (_, j) => (
                <View
                  key={j}
                  className="p-2 bg-white border-2 border-gray-300 rounded-lg"
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-row justify-start items-start gap-2 flex-1">
                      <Image
                        source={{
                          uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg/1200px-C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg",
                        }}
                        resizeMode="cover"
                        className="h-[36px] w-[40px] rounded-md opacity-85"
                      />
                      <View className="flex-1">
                        <Text
                          className="text-md font-psemibold mt-[-2px]"
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {j === 0 ? "Cơm tấm Sài Gòn" : "Phở bò"}
                        </Text>
                        <Text className="text-md italic text-gray-500 mt-[-2px]">
                          {j === 0 ? "120.000đ" : "80.000đ"}
                        </Text>
                      </View>
                    </View>

                    <View className="gap-2 items-end">
                      <Text className="bg-blue-100 text-blue-800 text-[12.5px] font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        Status
                      </Text>
                      <TouchableOpacity
                        onPress={() => {}}
                        className=" bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px] bg-white border-0 py-2"
                      >
                        <Text className="text-[14px] text-white text-[#227B94] font-semibold">
                          Chỉnh sửa
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="flex-row justify-end items-center gap-2">
                    {/* <Text className="text-gray-500 italic text-[12px]">
                    100 đơn cần xử lí trong 2h tới
                  </Text> */}
                    {/* <TouchableOpacity
                      onPress={() => {}}
                      className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px] bg-white border-0"
                    >
                      <Text className="text-[13.5px] text-white text-[#227B94] font-semibold">
                        Chỉnh sửa
                      </Text>
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity
                            onPress={() => {}}
                            className="bg-white border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                          >
                            <Text className="text-[13.5px]">Chi tiết</Text>
                          </TouchableOpacity> */}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <View className="items-center justify-center pt-1">
          <CustomButton
            title="Hoàn tất chỉnh sửa"
            handlePress={() => {}}
            containerStyleClasses="w-full h-[52px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10"
            // iconLeft={
            //   <Ionicons name="add-circle-outline" size={21} color="white" />
            // }
            textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
          />
          <CustomButton
            title="Xóa danh mục này"
            handlePress={() => {}}
            containerStyleClasses="mt-2 w-full h-[48px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10 border-secondary bg-white"
            // iconLeft={
            //   <Ionicons name="add-circle-outline" size={21} color="white" />
            // }
            textStyleClasses="text-[16px] text-gray-900 ml-1 text-secondary"
          />
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default CategoryUpdate;
