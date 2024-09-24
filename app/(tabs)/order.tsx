import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React from "react";
import CustomButton from "@/components/custom/CustomButton";
import { Searchbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const Order = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  return (
    <View className="w-full h-full bg-white text-black p-4 relative">
      <CustomButton
        title="09/10/2024 | 8:00-8:30"
        handlePress={() => {}}
        containerStyleClasses="h-[32px] px-3 bg-transparent border-2 border-gray-200 absolute bottom-4 right-4 bg-secondary-100 font-psemibold z-10"
        iconLeft={<Ionicons name="filter-outline" size={21} color="white" />}
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
              Chờ xác nhận
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Đã xác nhận
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Đã từ chối
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">Đơn hủy</Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Đang chuẩn bị
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">Đang giao</Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Giao hàng thành công
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Giao hàng thất bại
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Đang báo cáo
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">Hoàn tất</Text>
          </View>
        </ScrollView>
        <ScrollView style={{ width: "100%", flexGrow: 1 }}>
          <View className="gap-y-2 pb-[154px]">
            {Array.from({ length: 10 }, (_, i) => (
              <View
                key={i}
                className="p-4 pt-3 bg-white border-2 border-gray-300 rounded-lg"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="text-md font-psemibold">MS-150</Text>
                  <View className="flex-row gap-2 items-start">
                    {/* <TouchableOpacity
                      onPress={() => {}}
                      className="bg-white border-[#227B94] border-2 rounded-md items-center justify-center px-[4px] py-[2.2px]"
                    >
                      <Text className="text-[13.5px]">Chi tiết</Text>
                    </TouchableOpacity> */}
                    <Text className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      Status
                    </Text>
                  </View>
                </View>
                <View className="mt-4 gap-1">
                  <View className="flex-row justify-start items-center gap-2">
                    <Image
                      source={{
                        uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg/1200px-C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg",
                      }}
                      resizeMode="cover"
                      className="h-[36px] w-[40px] rounded-md opacity-85"
                    />
                    <View className="">
                      <Text className="text-md italic text-gray-500">
                        Cơm tấm sinh viên nhà Cám {" x2"}
                      </Text>
                      <Text className="text-md italic text-gray-500">
                        +2 sản phẩm khác
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-end gap-x-2 gap-y-1">
                    <Text className="text-[10px] italic text-gray-500">
                      Duy Đức đã đặt vào 19:00 19/09/2024
                    </Text>
                    <Text className="text-md italic text-gray-500">
                      120.000đ
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-end mt-2">
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

export default Order;
