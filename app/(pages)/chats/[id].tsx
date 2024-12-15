import { View, Text } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import Chatbox from "@/components/realtime/Chatbox";
const ChatBoxPage = () => {
  const param = useLocalSearchParams();
  return (
    <View className="flex-1">
      <Chatbox
        channelId={Number(param.id)}
        onBack={() => {
          router.back();
        }}
      />
    </View>
  );
};

export default ChatBoxPage;
