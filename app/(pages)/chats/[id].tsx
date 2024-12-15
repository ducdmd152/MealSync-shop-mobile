import { View, Text } from "react-native";
import React from "react";
import { router } from "expo-router";
import Chatbox from "@/components/realtime/Chatbox";
import { SafeAreaView } from "react-native-safe-area-context";
const ChatBoxPage = () => {
  return (
    <SafeAreaView className="flex-1">
      <Chatbox
        onBack={() => {
          router.back();
        }}
      />
    </SafeAreaView>
  );
};

export default ChatBoxPage;
