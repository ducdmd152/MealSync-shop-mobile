import CONSTANTS from "@/constants/data";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
import useGlobalSocketState from "@/hooks/states/useGlobalSocketState";
import { OrderChannelInfo, SocketChannelInfo } from "@/types/models/ChatModel";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "react-native-paper";
import apiClient from "../../services/api-services/api-client";
import { FetchOnlyListResponse } from "../../types/responses/FetchResponse";
import { router, useFocusEffect } from "expo-router";
const formatRecentDate = (createdDate: string): string => {
  const date = dayjs(createdDate);
  const now = dayjs();
  const daysDiff = dayjs(now.local().format("YYYY-MM-DD")).diff(
    dayjs(date.local().format("YYYY-MM-DD")).local(),
    "day"
  );
  if (daysDiff < 1) {
    return date.local().format("HH:mm");
  } else if (daysDiff === 1) {
    return date.local().format("HH:mm") + " hôm qua";
  } else if (daysDiff <= 30) {
    return `${daysDiff} ngày trước`;
  } else {
    return date.local().format("YYYY-MM-DD HH:mm");
  }
};
const Chats = () => {
  const globalSocketState = useGlobalSocketState();
  const { socket, setSocket } = globalSocketState;
  const [orderChannelList, setOrderChannelList] = useState<SocketChannelInfo[]>(
    []
  );
  const globalAuthState = useGlobalAuthState();
  const authId = globalAuthState.authDTO?.id || 0;

  const orderChannelInfosFetcher = useFetchWithRQWithFetchFunc(
    ["order/chat-info"],
    async (): Promise<FetchOnlyListResponse<OrderChannelInfo>> =>
      apiClient
        .get(
          `order/chat-info?${orderChannelList
            .map((channel) => `ids=${channel.id}`)
            .join("&")}`
        )
        .then((response) => response.data),
    [orderChannelList]
  );
  // useEffect(() => {
  //   console.log(
  //     "orderChannelInfosFetcher.isFetching: ",
  //     orderChannelInfosFetcher.isFetching
  //   );
  // }, [orderChannelInfosFetcher.isFetching]);

  const getChannelInfo = (orderId: number) => {
    if (
      orderChannelInfosFetcher.data?.value &&
      orderChannelInfosFetcher.data?.value.find((info) => info.id == orderId)
    ) {
      return orderChannelInfosFetcher.data?.value.find(
        (info) => info.id == orderId
      );
    }
    return {
      id: orderId,
      customer: null,
      shop: null,
      deliveryStaff: null,
    };
  };
  useEffect(() => {
    if (socket) {
      socket.on("getListChannel", (channels: SocketChannelInfo[]) => {
        console.log("Changing....: ", orderChannelList);
        setOrderChannelList(
          [...channels].sort((a: SocketChannelInfo, b: SocketChannelInfo) => {
            return (
              dayjs(b.updated_at).valueOf() - dayjs(a.updated_at).valueOf()
            );
          })
        );
      });
    }
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      if (socket) {
        orderChannelInfosFetcher.refetch();
        socket.emit("regisListChannel", true);
      }
      // dispatch(globalSlice.actions.setCurrentScreen("chatList"));
      // return () => {
      //   dispatch(globalSlice.actions.setCurrentScreen(""));
      // };
    }, [])
  );

  return (
    <ScrollView style={{ flexGrow: 1 }}>
      {orderChannelList.map((channel) => (
        <TouchableOpacity
          key={channel.id}
          onPress={() => {
            // console.log("HEllo");
            // router.push(`/chats/${channel.id}`);
          }}
          className={`p-3 px-4 bg-white border-b-[1px] border-gray-200 flex-row rounded-lg`}
          style={{
            backgroundColor: !channel.map_user_is_read[authId]
              ? "#fffbeb"
              : "#fff",
          }}
        >
          <Avatar.Image
            size={40}
            source={{
              uri: getChannelInfo(channel.id)?.customer
                ? getChannelInfo(channel.id)?.customer?.avatarUrl
                : CONSTANTS.url.avatarDefault,
            }}
          />
          <View className="ml-3 gap-y-1">
            <Text className="font-medium">{`MS-${channel.id} | ${
              getChannelInfo(channel.id)?.customer
                ? getChannelInfo(channel.id)?.customer?.fullName
                : ""
            }`}</Text>
            <View className="w-72 flex-row items-center justify-between text-[11px]">
              <View className="flex-1">
                <Text
                  className="text-ellipsis overflow-hidden whitespace-nowrap italic"
                  numberOfLines={1}
                >
                  {getChannelInfo(channel.id)?.customer?.fullName}:{" "}
                  {channel.last_message}
                </Text>
              </View>
              <Text className="italic text-[10px]">
                {formatRecentDate(dayjs(channel.updated_at).toISOString())}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Chats;
