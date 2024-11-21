import Chats from "@/components/realtime/Chats";
import useGlobalHeaderPage from "@/hooks/states/useGlobalHeaderPage";
import { useFocusEffect } from "expo-router";
import React from "react";
import { SafeAreaView, View } from "react-native";

const Chatting = () => {
  const globalHeaderPage = useGlobalHeaderPage();
  useFocusEffect(
    React.useCallback(() => {
      globalHeaderPage.setIsChattingFocusing(true);
      return () => {
        globalHeaderPage.setIsChattingFocusing(false);
      };
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="pt-2 bg-white flex-1">
        <Chats />
      </View>
    </SafeAreaView>
  );
};

export default Chatting;
