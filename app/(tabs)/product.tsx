import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Searchbar } from "react-native-paper";

const Product = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  return (
    <View className="w-full h-full bg-white text-black p-4 relative">
      <CustomButton
        title="Thêm mới"
        handlePress={() => {}}
        containerStyleClasses="h-[40px] px-4 bg-transparent border-2 border-gray-200 absolute bottom-4 right-4 bg-secondary-100 font-psemibold z-10"
        iconLeft={
          <Ionicons name="add-circle-outline" size={21} color="white" />
        }
        textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
      />
      <View className="w-full gap-2">
        <View className="w-full">
          <Searchbar
            style={{
              height: 50,
              // backgroundColor: "white",
              // borderColor: "lightgray",
              // borderWidth: 2,
            }}
            inputStyle={{ minHeight: 0 }}
            placeholder="Nhập mã đơn hoặc số điện thoại..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>
        <ScrollView style={{ width: "100%", flexShrink: 0 }} horizontal={true}>
          <View className="w-full flex-row gap-2 items-center justify-between pb-2">
            <Text className="bg-gray-100 rounded-xl px-4 py-2 bg-secondary">
              Tất cả
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Trong khung giờ
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Ngoài khung giờ
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Tạm hết hàng
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">Đã ẩn</Text>
          </View>
        </ScrollView>
        <ScrollView style={{ width: "100%", flexGrow: 1 }}>
          <View className="gap-y-2 pb-[154px]">
            {Array.from({ length: 10 }, (_, i) => (
              <View
                key={i}
                className="p-4 pt-3 bg-white border-2 border-gray-300 rounded-lg"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-row justify-start items-start gap-2">
                    <Image
                      source={{
                        uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg/1200px-C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg",
                      }}
                      resizeMode="cover"
                      className="h-[36px] w-[40px] rounded-md opacity-85"
                    />
                    <View className="">
                      <Text className="text-md font-psemibold mt-[-2px]">
                        Cơm tấm Sài Gòn
                      </Text>
                      <Text className="text-md italic text-gray-500 mt-[-2px]">
                        120.000đ
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2 items-start">
                    <Text className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      Status
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-end gap-2 pt-4">
                  <TouchableOpacity
                    onPress={() => {}}
                    className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                  >
                    <Text className="text-[13.5px] text-white">Chỉnh sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {}}
                    className="bg-white border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                  >
                    <Text className="text-[13.5px]">Chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Product;
