import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Searchbar } from "react-native-paper";
import Collapsible from "react-native-collapsible";
import { Tab } from "react-native-elements";
import MenuMainItems from "@/components/menu/MenuMainItems";
import MenuGroupOptions from "@/components/menu/MenuGroupOptions";
import useCounterState from "@/hooks/states/useCounterState";
import usePathState from "@/hooks/states/usePathState";

const Menu = () => {
  const { menuSessionIndex, setMenuSessionIndex } = usePathState();
  const counter = useCounterState((state) => state.counter);
  const increment = useCounterState((state) => state.increment);
  const reset = useCounterState((state) => state.reset);
  const changeMax = useCounterState((state) => state.changeMax);
  return (
    <View className="bg-white">
      <View className="p-2 pb-0">
        <View className="flex-row items-center justify-center border-2 border-gray-200 rounded-md">
          <CustomButton
            title="Thực đơn chính"
            handlePress={() => {
              setMenuSessionIndex(0);
            }}
            containerStyleClasses={`flex-1 px-2  h-[40px] rounded-md ${
              menuSessionIndex == 0 ? "bg-primary-100" : "bg-white"
            }`}
            textStyleClasses={`text-sm ${
              menuSessionIndex == 0 ? "text-white" : ""
            }`}
          />
          <View className="w-[4px]"></View>
          <CustomButton
            title="Nhóm lựa chọn"
            handlePress={() => {
              setMenuSessionIndex(1);
            }}
            containerStyleClasses={`flex-1 px-2  h-[40px] rounded-md ${
              menuSessionIndex == 1 ? "bg-primary-100" : "bg-white"
            }`}
            textStyleClasses={`text-sm ${
              menuSessionIndex == 1 ? "text-white" : ""
            }`}
          />
        </View>
      </View>
      {menuSessionIndex == 0 ? <MenuMainItems /> : <MenuGroupOptions />}
    </View>
  );
};

export default Menu;
