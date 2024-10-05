import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import React from "react";
import CustomButton from "../custom/CustomButton";
import { Searchbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const MenuGroupOptions = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  return (
    <View className="w-full h-full bg-white text-black  relative">
      <View className="absolute w-full items-center justify-center bottom-28 left-0 z-10">
        <CustomButton
          title="Thêm nhóm lựa chọn"
          handlePress={() => {}}
          containerStyleClasses="w-[98%] h-[50px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[15px] text-gray-900 ml-1 text-white"
        />
      </View>
      <View className="w-full gap-2 p-4">
        <View className="w-full">
          <Searchbar
            style={{
              height: 40,
              // backgroundColor: "white",
              // borderColor: "lightgray",
              // borderWidth: 2,
            }}
            inputStyle={{ minHeight: 0 }}
            placeholder="Nhập tiêu đề nhóm..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>
        <Text className="text-right italic gray-700">
          4 nhóm lựa chọn có sẵn
        </Text>
        <ScrollView style={{ width: "100%", flexGrow: 1 }}>
          <View className="gap-y-2 pb-[240px]">
            <ScrollView style={{ width: "100%", flexGrow: 1 }}>
              <View className="gap-y-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <View
                    key={i}
                    className="p-4 pt-3 bg-white drop-shadow-lg rounded-lg shadow border-2 border-gray-200"
                  >
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-row flex-1 justify-start items-start gap-x-2">
                        {/* <View className="self-stretch">
                        <Image
                          source={{
                            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdcArSQUEt5D7oqzkUhMpP-PIQK6g6BtbFow&s",
                          }}
                          resizeMode="cover"
                          className="h-[52px] w-[62px] rounded-md opacity-85"
                        />
                      </View> */}
                        <View className="flex-1">
                          <Text
                            className="text-[12.5px] font-psemibold mt-[-2px]"
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            Cỡ ly
                          </Text>
                          <Text className="text-[12px] italic text-gray-500 mt-[-2px]">
                            S (nhỏ), M (vừa), L (lớn)
                          </Text>
                        </View>
                      </View>
                      <Text className="bg-blue-100 text-blue-800 text-[12px] font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        Status
                      </Text>
                    </View>
                    <View className="flex-row justify-start gap-2 pt-3">
                      <TouchableOpacity
                        onPress={() => {}}
                        className="bg-[#227B94] border-[#227B94] border-0 rounded-md items-center justify-center px-[6px] py-[2.2px] bg-white "
                      >
                        <Text className="text-[13.5px] text-white text-[#227B94] font-semibold">
                          Chỉnh sửa
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {}}
                        className="bg-[#227B94] border-[#227B94] border-0 rounded-md items-center justify-center px-[6px] py-[2.2px] bg-white "
                      >
                        <Text className="text-[13.5px] text-white text-[#227B94] font-semibold">
                          3 món đang liên kết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default MenuGroupOptions;
