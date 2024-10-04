import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Searchbar } from "react-native-paper";
import Collapsible from "react-native-collapsible";
import { Tab } from "react-native-elements";
import MenuMainItems from "@/components/menu/MenuMainItems";
import MenuGroupOptions from "@/components/menu/MenuGroupOptions";

const Menu = () => {
  const [index, setIndex] = React.useState(0);
  return (
    <View className="bg-white">
      <View className="p-2 pb-0">
        <View className="flex-row items-center justify-center border-2 border-gray-200 rounded-md">
          <CustomButton
            title="Thực đơn chính"
            handlePress={() => {
              setIndex(0);
            }}
            containerStyleClasses={`flex-1 px-2  h-[40px] rounded-md ${
              index == 0 ? "bg-primary-100" : "bg-white"
            }`}
            textStyleClasses={`text-sm ${index == 0 ? "text-white" : ""}`}
          />
          <View className="w-[4px]"></View>
          <CustomButton
            title="Lựa chọn phụ"
            handlePress={() => {
              setIndex(1);
            }}
            containerStyleClasses={`flex-1 px-2  h-[40px] rounded-md ${
              index == 1 ? "bg-primary-100" : "bg-white"
            }`}
            textStyleClasses={`text-sm ${index == 1 ? "text-white" : ""}`}
          />
        </View>
      </View>
      {index == 0 ? <MenuMainItems /> : <MenuGroupOptions />}
    </View>
  );
};

export default Menu;
