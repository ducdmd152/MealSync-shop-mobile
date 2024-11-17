import { View, Text } from "react-native";
import React from "react";
import Notifications from "@/components/realtime/Notifications";

const NotificationPage = () => {
  return (
    <View className="flex-1 h-full p-4 bg-white">
      <Notifications />
    </View>
  );
};

export default NotificationPage;
