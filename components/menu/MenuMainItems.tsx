import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Searchbar } from "react-native-paper";
import Collapsible from "react-native-collapsible";
import { Tab } from "react-native-elements";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { BottomSheet } from "@rneui/themed";

const initialCategories = [
  { id: 1, name: "Ăn sáng", items: 2, isCollapsible: true },
  { id: 2, name: "Ăn trưa", items: 2, isCollapsible: true },
  { id: 3, name: "Ăn tối", items: 2, isCollapsible: true },
];

const Menu = () => {
  const [index, setIndex] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const [categories, setCategories] = useState(initialCategories);

  const renderCategory = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<{
    id: number;
    name: string;
    items: number;
    isCollapsible: boolean;
  }>) => {
    const i = categories.findIndex((cat) => cat.id === item.id);
    return (
      <View key={item.id} className="mb-1">
        <TouchableOpacity
          className="flex-row justify-between items-center pr-2 mb-2"
          onPress={() =>
            setCategories(
              categories.map((cat) =>
                item.id === cat.id
                  ? { ...cat, isCollapsible: !cat.isCollapsible }
                  : cat
              )
            )
          }
          onLongPress={drag}
        >
          <View>
            <View className="flex-row items-center gap-x-2">
              <Text className="font-bold text-lg text-gray-800">
                {item.name}
              </Text>
              <Text className="text-gray-700 text-sm">2 món</Text>
            </View>
            <CustomButton
              title="Chỉnh sửa danh mục"
              handlePress={() => {}}
              containerStyleClasses="bg-white border-gray-200 border-2 h-[26px] px-[8px]"
              textStyleClasses="text-gray-700 text-[11px] mt-[-5px] text-[#227B94]"
              // iconRight={
              //   <View className="ml-1">
              //     <Ionicons
              //       name="create-outline"
              //       size={14}
              //       color="#227B94"
              //     />
              //   </View>
              // }
            />
          </View>
          <View className="flex-row items-center gap-x-6">
            {item.isCollapsible ? (
              <Ionicons name="chevron-up-outline" size={21} color="gray" />
            ) : (
              <Ionicons name="chevron-down-outline" size={21} color="gray" />
            )}
          </View>
        </TouchableOpacity>

        <Collapsible collapsed={item.isCollapsible}>
          <View className="gap-y-2 pb-2">
            {Array.from({ length: 2 }, (_, j) => (
              <View
                key={j}
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
                    <View>
                      <Text className="text-md font-psemibold mt-[-2px]">
                        {j === 0 ? "Cơm tấm Sài Gòn" : "Phở bò"} - {item.name}
                      </Text>
                      <Text className="text-md italic text-gray-500 mt-[-2px]">
                        {j === 0 ? "120.000đ" : "80.000đ"} - {item.name}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2 items-start">
                    <Text className="bg-blue-100 text-blue-800 text-[12.5px] font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      Status
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center gap-2 pt-2">
                  <Text className="text-gray-500 italic text-[12px]">
                    100 đơn cần xử lí trong 2h tới
                  </Text>
                  <TouchableOpacity
                    onPress={() => {}}
                    className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                  >
                    <Text className="text-[13.5px] text-white">Chỉnh sửa</Text>
                  </TouchableOpacity>
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
        </Collapsible>

        <View className="border-b-2 border-gray-200"></View>
      </View>
    );
  };

  return (
    <View className="w-full h-full bg-white text-black  relative">
      <View className="absolute w-full items-center justify-center bottom-28 left-0 z-10">
        <CustomButton
          title="Thêm món/danh mục mới"
          handlePress={() => {
            setIsBottomSheetVisible(true);
          }}
          containerStyleClasses="w-[98%] h-[44px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[14px] text-gray-900 ml-1 text-white"
        />
      </View>

      <View className="w-full gap-2 p-4">
        {/* <View className="w-full">
          <Searchbar
            style={{
              height: 50,
              // backgroundColor: "white",
              // borderColor: "lightgray",
              // borderWidth: 2,
            }}
            inputStyle={{ minHeight: 0 }}
            placeholder="Nhập tên món..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View> */}
        <ScrollView style={{ width: "100%", flexShrink: 0 }} horizontal={true}>
          <View className="w-full flex-row gap-2 items-center justify-between pb-2 ">
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
        <View className="gap-y-2 pb-[200px]">
          <DraggableFlatList
            style={{ width: "100%", flexGrow: 1 }}
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => `category-${item.id}`}
            onDragEnd={({ data }) => {
              setCategories(data);
            }}
          />
        </View>
      </View>

      <BottomSheet modalProps={{}} isVisible={isBottomSheetVisible}>
        <View className="p-4 bg-white rounded-t-lg min-h-[120px] ">
          <TouchableOpacity
            className="items-center"
            onPress={() => setIsBottomSheetVisible(false)}
          >
            <Ionicons name="chevron-down-outline" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity className="p-4">
            <Text className="text-lg text-primary font-semibold shadow drop-shadow-lg">
              Thêm món mới
            </Text>
            <Text className="text-sm text-gray-400 italic">
              Ví dụ: trà sữa, bánh ngọt,...
            </Text>
          </TouchableOpacity>
          <View className="border-b-2 border-gray-200"></View>
          <TouchableOpacity className="p-4">
            <Text className="text-lg text-primary font-semibold">
              Thêm danh mục mới
            </Text>

            <Text className="text-sm text-gray-400 italic">
              Ví dụ: đồ uống, ăn nhanh,...
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default Menu;
