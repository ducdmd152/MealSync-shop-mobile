import { View, Text } from "react-native";
import React from "react";
import { router } from "expo-router";
import Chatbox from "@/components/realtime/Chatbox";
const ChatBoxPage = () => {
  return (
    <View className="h-full w-full">
      <Chatbox
        onBack={() => {
          router.back();
        }}
      />
    </View>
  );
};

export default ChatBoxPage;
