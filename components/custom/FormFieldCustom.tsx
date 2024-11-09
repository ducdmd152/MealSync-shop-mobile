import { icons } from "@/constants";
import React, { ReactNode, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  TextInputProps,
} from "react-native";

interface FormFieldProps extends TextInputProps {
  title: string;
  value: string;
  placeholder?: string;
  handleChangeText: (text: string) => void;
  otherStyleClasses?: string;
  otherInputStyleClasses?: string;
  otherTextInputStyleClasses?: string;
  isPassword?: boolean;
  isRequired?: boolean;
  labelOnly?: boolean;
  iconRight?: ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  titleStyleClasses?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  title,
  value,
  placeholder = "",
  handleChangeText,
  otherStyleClasses: otherStyles = "",
  otherInputStyleClasses = "",
  otherTextInputStyleClasses = "",
  isPassword,
  isRequired = false,
  iconRight,
  multiline = false,
  numberOfLines = 1,
  labelOnly = false,
  titleStyleClasses = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <View className="flex-row items-center">
        <Text
          className={`text-base text-gray-500 font-medium ${titleStyleClasses}`}
        >
          {title}
        </Text>
        {isRequired && <Text className="ml-1 text-[14px] text-[red]">*</Text>}
      </View>

      {!labelOnly && (
        <View
          className={`w-full h-16 px-4 rounded-2xl border-2 border-gray-400 focus:border-secondary flex flex-row items-center ${otherInputStyleClasses}`}
        >
          <TextInput
            style={{ textAlignVertical: "center" }}
            className={
              "flex-1 text-gray font-semibold text-base border-0 border-gray-800 mb-1" +
              otherTextInputStyleClasses
            }
            multiline={multiline}
            numberOfLines={numberOfLines}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7B7B8B"
            onChangeText={handleChangeText}
            secureTextEntry={isPassword && !showPassword}
            {...props}
          />

          {isPassword && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image
                source={!showPassword ? icons.eye : icons.eyeHide}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          {iconRight ? iconRight : ""}
        </View>
      )}
    </View>
  );
};

export default FormField;
