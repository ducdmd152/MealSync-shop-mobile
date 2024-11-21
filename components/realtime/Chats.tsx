import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  Alert,
  TouchableOpacity,
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
import { Avatar } from "react-native-paper";
import CONSTANTS from "@/constants/data";
const Chats = () => {
  return (
    <ScrollView style={{ flexGrow: 1 }}>
      {Array.from({ length: 20 }, (_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {}}
          className={`p-3 px-4 bg-white border-b-[0.5px] border-gray-200 flex-row`}
          style={{ backgroundColor: index < 3 ? "#fffbeb" : "#fff" }}
        >
          <Avatar.Image
            size={40}
            source={{
              uri: CONSTANTS.url.avatarDefault,
            }}
          />
          <View className="ml-3 gap-y-1">
            <Text className="font-medium">MS-100</Text>
            <Text className="text-[11px]">
              Shipper: tôi đang đến{" "}
              <Text className="italic text-[9px]"> 11:20</Text>
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Chats;
