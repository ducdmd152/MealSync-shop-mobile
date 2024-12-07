import { View, Text, TouchableOpacity } from "react-native";
import React, { ReactNode } from "react";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  title: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  close?: () => void;
  children: ReactNode;
  containerStyleClasses?: string;
  titleStyleClasses?: string;
  hasHeader?: boolean;
  onBackdropPress?: () => void;
}
const CustomModal = ({
  title,
  isOpen,
  setIsOpen,
  children,
  containerStyleClasses = "",
  titleStyleClasses = "",
  close,
  hasHeader = true,
  onBackdropPress = () => {},
}: Props) => {
  return (
    <Modal isVisible={isOpen} onBackdropPress={() => onBackdropPress()}>
      <View
        // style={{ flex: 1, zIndex: 100 }}
        className="justify-center items-center"
      >
        <View
          className={`bg-white p-4 rounded-lg w-80 ${containerStyleClasses}`}
        >
          {hasHeader && (
            <View className="flex-row items-center justify-between">
              <Text className={`${titleStyleClasses}`}>{title}</Text>
              <TouchableOpacity
                className="p-[2px]"
                onPress={() => {
                  (close || setIsOpen)(false);
                }}
              >
                <Ionicons name="close-outline" size={24} color="gray" />
              </TouchableOpacity>
            </View>
          )}

          {children}
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;
