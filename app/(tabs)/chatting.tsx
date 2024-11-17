import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import FetchResponse from "../../types/responses/FetchResponse";
import TestModel from "../../types/models/TestModel";
import apiClient from "../../services/api-services/api-client";
import { endpoints } from "../../services/api-services/api-service-instances";
import useCounterState from "@/hooks/states/useCounterState";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import useGlobalHeaderPage from "@/hooks/states/useGlobalHeaderPage";
import { router, useFocusEffect } from "expo-router";
import PubNub from "pubnub";
import { PubNubProvider } from "pubnub-react";
import { Chat, MemberList } from "@pubnub/react-native-chat-components";
import Chats from "@/components/realtime/Chats";

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
      <View className="pt-3 bg-white flex-1">
        <Chats />
      </View>
    </SafeAreaView>
  );
};

export default Chatting;
