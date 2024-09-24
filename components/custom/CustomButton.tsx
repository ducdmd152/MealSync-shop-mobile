import { ReactNode } from "react";
import {
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from "react-native";

interface CustomButtonProps {
  title: string;

  handlePress: () => void;
  containerStyleClasses?: string;
  containerStyleObject?: StyleProp<ViewStyle>;
  textStyleClasses?: string;
  textStyleObject?: StyleProp<ViewStyle>;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const CustomButton = ({
  title,
  handlePress,
  containerStyleClasses,
  containerStyleObject,
  textStyleClasses,
  textStyleObject,
  iconLeft,
  iconRight,
  isLoading,
  isDisabled,
}: CustomButtonProps) => {
  console.log(title + " isDisable: " + isDisabled);
  return (
    <TouchableOpacity
      disabled={isDisabled || isLoading}
      onPress={handlePress}
      activeOpacity={0.7}
      className={`flex-row bg-secondary rounded-xl h-[52px] px-4 justify-center items-center ${
        containerStyleClasses || ""
      } ${isDisabled || isLoading ? "opacity-70" : ""}`}
      style={containerStyleObject}
    >
      {iconLeft ? iconLeft : ""}
      <Text
        className={`text-primary text-lg font-psemibold ${
          textStyleClasses || ""
        }`}
        style={textStyleObject}
      >
        {title}
      </Text>
      {iconRight ? iconRight : ""}
      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
