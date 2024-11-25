import { View, Text, Image, Touchable, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { images } from "@/constants";
import { router } from "expo-router";
import useGlobalHeaderPage from "@/hooks/states/useGlobalHeaderPage";
import useGlobalNotiState from "@/hooks/states/useGlobalNotiState";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import FetchResponse, {
  FetchValueResponse,
} from "@/types/responses/FetchResponse";
import apiClient from "@/services/api-services/api-client";

const TabHeader = () => {
  const globalHeaderPage = useGlobalHeaderPage();
  const globalNotiState = useGlobalNotiState();
  const numberOfUnreaded = useFetchWithRQWithFetchFunc(
    ["shop-owner-staff/notification/total-unread"],
    async (): Promise<FetchValueResponse<{ totalUnerad: number }>> =>
      apiClient
        .get("shop-owner-staff/notification/total-unread")
        .then((response) => response.data),
    [globalHeaderPage.isNotiPageFocusing]
  );
  useEffect(() => {
    if (globalNotiState.toggleChangingFlag) numberOfUnreaded.refetch();
  }, [globalNotiState.toggleChangingFlag]);
  return (
    <View className="w-full h-[64px] px-4 bg-white flex-row justify-between border-b-[0.7px] border-gray-300 overflow-hidden">
      <View className="flex-row justify-center items-center">
        {/* <View className="flex-row justify-center items-center">
          <Ionicons name="menu-outline" size={36} color="#DF4830" />
        </View> */}
        {/* <Image
          source={images.logoText}
          className="h-[28px] ml-[-68px] mt-[2px]"
          resizeMode="contain"
        /> */}
        <Image
          source={images.logoText}
          className="h-[32px] ml-[-68px] mt-[6px]"
          resizeMode="contain"
        />
        {/* <Image
          source={images.logoTextPlusSquare}
          className="h-[31px] ml-[-88px] mt-[8px]"
          resizeMode="contain"
        /> */}
      </View>
      <View className="flex-row justify-center items-center gap-2">
        <TouchableOpacity
          onPress={() => router.push("/notification")}
          className="flex-row justify-center items-center relative"
        >
          <Ionicons
            name={
              globalHeaderPage.isNotiPageFocusing
                ? "notifications"
                : "notifications-outline"
            }
            size={32}
            color="#DF4830"
          />
          {!globalHeaderPage.isNotiPageFocusing &&
            numberOfUnreaded.data &&
            numberOfUnreaded.data?.value.totalUnerad > 0 && (
              <View className="items-center justify-center bg-secondary h-[24px] w-[24px] rounded-full absolute top-[-8] right-[-8]">
                <Text className="text-[9px] font-medium">
                  {numberOfUnreaded.data.value.totalUnerad < 10
                    ? numberOfUnreaded.data.value.totalUnerad.toString()
                    : "9+"}
                </Text>
              </View>
            )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/chatting")}
          className="flex-row justify-center items-center relative"
        >
          <Ionicons
            name={
              globalHeaderPage.isChattingFocusing
                ? "chatbubbles"
                : "chatbubbles-outline"
            }
            size={32}
            color="#DF4830"
          />
          {!globalHeaderPage.isChattingFocusing &&
            numberOfUnreaded.data &&
            numberOfUnreaded.data?.value.totalUnerad > 0 && (
              <View className="items-center justify-center bg-secondary h-[24px] w-[24px] rounded-full absolute top-[-8] right-[-8]">
                <Text className="text-[9px] font-medium">
                  {numberOfUnreaded.data.value.totalUnerad < 10
                    ? numberOfUnreaded.data.value.totalUnerad.toString()
                    : "9+"}
                </Text>
              </View>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TabHeader;
