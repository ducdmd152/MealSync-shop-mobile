import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Searchbar } from "react-native-paper";
import Collapsible from "react-native-collapsible";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { BottomSheet } from "@rneui/themed";
import { router } from "expo-router";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";

const initialCategories = [
  { id: 1, name: "Ăn sáng", items: 2, isCollapsible: true, linked: false },
  { id: 2, name: "Ăn trưa", items: 2, isCollapsible: true, linked: false },
  { id: 3, name: "Ăn tối", items: 2, isCollapsible: true, linked: false },
];

const OptionGroupLink = () => {
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
    linked: boolean; // Added linked status
  }>) => {
    const i = categories.findIndex((cat) => cat.id === item.id);

    const handleLinkToggle = () => {
      const action = item.linked ? "gỡ liên kết" : "liên kết";
      Alert.alert(
        `Xác nhận ${action}`,
        `Bạn có chắc chắn muốn ${action} món này?`,
        item.linked
          ? [
              {
                text: "Đồng ý",
                onPress: () => {
                  setCategories((prevCategories) =>
                    prevCategories.map((cat, idx) =>
                      idx === i ? { ...cat, linked: !cat.linked } : cat
                    )
                  );
                },
              },
              {
                text: "Hủy",
                style: "cancel",
              },
            ]
          : [
              {
                text: "Hủy",
                style: "cancel",
              },
              {
                text: "Đồng ý",
                onPress: () => {
                  setCategories((prevCategories) =>
                    prevCategories.map((cat, idx) =>
                      idx === i ? { ...cat, linked: !cat.linked } : cat
                    )
                  );
                },
              },
            ]
      );
    };

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
                        className="text-[12.5px] font-psemibold mt-[-2px]"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {j === 0 ? "Cơm tấm Sài Gòn" : "Phở bò"} - {item.name}
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
                  <Text className="text-gray-500 italic text-[12px] text-secondary-200"></Text>
                  <TouchableOpacity
                    onPress={handleLinkToggle}
                    className={`rounded-md items-center justify-center px-[6px] py-[2.2px] ${
                      item.linked ? "bg-red-500" : "bg-[#227B94]"
                    }`}
                  >
                    <Text className="text-[13.5px] text-white font-semibold">
                      {item.linked ? "Gỡ liên kết" : "Liên kết"}
                    </Text>
                  </TouchableOpacity>
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
    <PageLayoutWrapper isScroll={false}>
      <View className="bg-gray-200 p-4">
        <Text className="text-[16px] font-semibold text-gray-800 ">
          Liên kết "Kích cỡ" với thực đơn chính
        </Text>
      </View>

      <ScrollView style={{ flexGrow: 1 }}>
        <View
          className="flex-1 w bg-white text-black  relative"
          style={{ height: "100%" }}
        >
          <View className="w-full gap-2 p-4">
            <Text className="text-[14px] text-gray-800 mt-2 italic">
              4 món đã được liên kết
            </Text>
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
        </View>
      </ScrollView>
      <View className="p-4">
        <CustomButton
          title="Hoàn tất"
          containerStyleClasses="mt-2 bg-primary"
          textStyleClasses="text-white"
          handlePress={() => {
            router.replace("/menu/option-group/create");
          }}
        />
      </View>
    </PageLayoutWrapper>
  );
};

export default OptionGroupLink;
