import { View, Text } from "react-native";
import React from "react";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
interface Props {
  title: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  body: ReactNode;
  containerStyleClasses?: string;
  titleStyleClasses?: string;
}
const CustomModal = ({
  title,
  isOpen,
  setIsOpen,
  body,
  containerStyleClasses = "",
  titleStyleClasses = "",
}: Props) => {
  return (
    <Modal isVisible={isOpen}>
      <View
        style={{ flex: 1, zIndex: 100 }}
        className="justify-center items-center"
      >
        <View
          className={`bg-white p-4 rounded-lg w-80 ${containerStyleClasses}`}
        >
          <View className="flex-row items-center justify-between">
            <Text className={titleStyleClasses}>{title}</Text>
            <TouchableOpacity
              onPress={() => {
                setIsOpen(false);
              }}
            >
              <Ionicons name="close-outline" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          {body}
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;
