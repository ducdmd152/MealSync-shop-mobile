import React from "react";
import { View, Text, Platform, TouchableOpacity } from "react-native";
import { Checkbox } from "react-native-paper";
interface CustomCheckboxProps {
  isChecked: boolean;
  handlePress: () => void;
  containerStyleClasses?: string;
  textStyleClasses?: string;
  label: React.ReactNode;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  isChecked,
  handlePress,
  containerStyleClasses,
  textStyleClasses,
  label,
}) => {
  return (
    <View
      className={`flex-row items-center justify-start mx-[0.2px] ${containerStyleClasses}`}
    >
      <View
        className={`${
          Platform.OS === "ios" ? "border-2 rounded h-[28px] w-[28px] ml-1" : ""
        } border-gray-300 justify-center items-center relative mr-2`}
      >
        {Platform.OS === "ios" ? (
          <View
            className={`${Platform.OS === "ios" ? "mt-[-8px] ml-[-5px]" : ""}`}
          >
            <Checkbox.IOS
              status={isChecked ? "checked" : "unchecked"}
              onPress={handlePress}
            />
          </View>
        ) : (
          <Checkbox.Android
            status={isChecked ? "checked" : "unchecked"}
            onPress={handlePress}
          />
        )}
      </View>

      {/* Render custom label or default text */}
      <Text
        className={`flex-1 font-semibold text-gray-600 text-[12px] italic ${textStyleClasses}`}
      >
        {label}
      </Text>
    </View>
  );
};

export default CustomCheckbox;
