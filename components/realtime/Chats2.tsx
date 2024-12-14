import { Colors } from "@/constants/Colors";
import useGlobalChattingState from "@/hooks/states/useChattingState";
import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
import useGlobalSocketState from "@/hooks/states/useGlobalSocketState";
import apiClient from "@/services/api-services/api-client";
import { useIsFocused } from "@react-navigation/native";
import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Divider, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChannelInfo {
  avatarUrl: string;
  fullName: string;
  id: string;
}

interface Channel {
  id: string;
  info: ChannelInfo;
  last_message: string;
  last_update_id: string;
  updated_at: string;
  map_user_is_read: {
    [key: string]: boolean;
  };
}

interface SocketMessage {
  data: Channel[];
  pageState: string | null;
  hasNext: boolean;
}

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 5, height: 8 },
    shadowColor: Colors.shadow[300],
    shadowOpacity: 0.1,
    elevation: 6,
  },
  shadowSelected: {
    shadowOffset: { width: 8, height: 8 },
    shadowColor: Colors.shadow.DEFAULT,
    shadowOpacity: 0.6,
    elevation: 20,
  },
});
interface DateTimeFormatOptions extends Intl.DateTimeFormatOptions {
  timeZone: string;
}

export function formatDateTime(dateString: string): string {
  // Create a Date object using the UTC timestamp
  const dateObj = new Date(dateString);

  // Define options for formatting in Ho Chi Minh City time
  const options: DateTimeFormatOptions = {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  // Format the date and time in the desired format
  const formattedDate = dateObj.toLocaleString("vi-VN", options);

  // Split the formatted date into date and time parts
  const [datePart, timePart] = formattedDate.split(", ");

  // Return the final formatted string in the desired format
  return `${datePart} ${timePart}`;
}
const PreviewCardChat: React.FC<{ item: Channel | null }> = ({ item }) => {
  const { width } = Dimensions.get("window");
  const widthImage = (width * 15) / 100;
  const widthItem = (width * 90) / 100;

  const globalAuthState = useGlobalAuthState();
  const userInfo = globalAuthState?.authDTO;
  if (!item) return null;
  const setGlobalChannelId = useGlobalChattingState(
    (state) => state.setChannelId
  );
  return (
    <View
      style={{
        borderRadius: 16,
        backgroundColor: !item.map_user_is_read[`${userInfo?.id}`]
          ? "#dffff3"
          : "white",
        ...styles.shadow,
      }}
    >
      <TouchableRipple
        borderless={true}
        onPress={() => {
          setGlobalChannelId(Number(item.id) || 0);
          router.push(`/chats/${item.id}`);
        }}
        style={{ borderRadius: 16 }}
      >
        <View
          className="flex-row"
          style={{
            width: widthItem,
            height: widthImage,
          }}
        >
          <Image
            source={{ uri: item.info.avatarUrl }}
            style={{
              height: widthImage,
              width: widthImage,
              borderRadius: 16,
            }}
          />
          <View className="pl-4 pr-3 pt-1 flex-1">
            <View className="flex-row justify-between items-start">
              <Text className="text-base font-bold text-blue-800">
                <Text className="text-md text-gray-400">MS-{item.id}</Text>
              </Text>
            </View>
            <View className="pr-2 flex-row">
              <Text
                numberOfLines={1}
                className="flex-wrap flex-1 text-xs text-gray-600 text-ellipsis"
                style={{
                  fontWeight: item.map_user_is_read[`${userInfo?.id}`]
                    ? 400
                    : "bold",
                }}
              >
                {item.info.fullName} : {item.last_message}
              </Text>
              <Text className="text-xs text-gray-500">
                {dayjs(item.updated_at).local().format("HH:mm")}
              </Text>
            </View>
          </View>
        </View>
      </TouchableRipple>
    </View>
  );
};

const emptyList = Array(5).fill(null);

const ListChatChannelPage: React.FC = () => {
  const isFocus = useIsFocused();
  const [isLoadError, setIsLoadError] = useState(false);

  const { socket } = useGlobalSocketState();
  const [listChannel, setListChannel] = useState<any[] | null>(null);
  const [listChannelSocket, setListChannelSocket] = useState<Channel[] | null>(
    null
  );
  const [listChannelMerge, setListChannelMerge] = useState<Channel[] | null>(
    null
  );
  const [pageState, setPageState] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [onRequest, setOnRequest] = useState(false);

  const listRef = useRef<Channel[] | null>(null);
  const hasNext2 = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (socket) {
        socket.on("getListChannel", (msg: SocketMessage) => {
          setOnRequest(true);
          console.log(msg, " mesage neeeeeee");
          if (msg) {
            hasNext2.current = msg.hasNext;
          }
          if (msg?.data?.length > 0) {
            const listRoomIds = msg.data.map((i) => i.id);
            setListChannelSocket(msg.data);
            handleGetListChannelInfo(listRoomIds);
            setPageState(msg.pageState);
          } else {
            setHasNext(false);
          }
        });

        socket.on("getNewMessage", async (msg: Channel) => {
          if (msg) {
            await handleGetNewMessage(msg);
          }
        });
      }
    }, [])
  );
  // useEffect(() => {
  //   if (socket) {
  //     socket.on("getListChannel", (msg: SocketMessage) => {
  //       setOnRequest(true);
  //       console.log(msg, " mesage neeeeeee");
  //       if (msg) {
  //         hasNext2.current = msg.hasNext;
  //       }
  //       if (msg?.data?.length > 0) {
  //         const listRoomIds = msg.data.map((i) => i.id);
  //         setListChannelSocket(msg.data);
  //         handleGetListChannelInfo(listRoomIds);
  //         setPageState(msg.pageState);
  //       } else {
  //         setHasNext(false);
  //       }
  //     });

  //     socket.on("getNewMessage", async (msg: Channel) => {
  //       if (msg) {
  //         await handleGetNewMessage(msg);
  //       }
  //     });
  //   }
  // }, []);

  const handleGetListChannelInfo = async (listRoomIds: string[]) => {
    setIsLoadError(false);
    try {
      const queryString = listRoomIds
        .map((id) => `ids=${encodeURIComponent(id)}`)
        .join("&");

      const res = await apiClient.get(`order/chat-info?${queryString}`);
      setHasNext(hasNext2.current);
      const data = await res.data;
      setListChannel(data.value);
    } catch (e) {
      setOnRequest(false);
      setIsLoadError(true);
      console.log("Get list all chat channel error: ", e);
    }
  };
  const handleGetNewMessage = async (msg: Channel) => {
    setIsLoadError(false);
    try {
      const res = await apiClient.get("order/chat-info?ids=" + msg.id);

      const data = await res.data;
      if (data.isSuccess && data.value?.[0]) {
        const newMergeData = {
          ...msg,
          info: data.value[0][msg.last_update_id],
        };

        if (listRef.current) {
          const newListMergeData = listRef.current.filter(
            (i) => i.id !== msg.id
          );
          const newList = [newMergeData, ...newListMergeData];

          setListChannelMerge(newList);
          listRef.current = newList;
        }
      }
    } catch (e) {
      console.log("Get list all chat channel error: ", e);
      setIsLoadError(true);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.emit("regisListChannel", {
        pageState: null,
        pageSize: 10,
      });
    }
    return () => {
      setListChannelMerge([]);
    };
  }, [isFocus]);

  useEffect(() => {
    if (listChannel && listChannelSocket) {
      const mapChannelSocket = listChannelSocket.reduce((acc, channel) => {
        acc[channel.id] = channel;
        return acc;
      }, {} as { [key: string]: Channel });

      let listChannelMergeInfo = listChannel.map((item) => ({
        ...mapChannelSocket[item.id],
        info: item[mapChannelSocket[item.id].last_update_id],
      }));

      if (listChannelMerge) {
        const existingIds = new Set(
          listChannelMergeInfo.map((item) => item.id)
        );
        const filteredListChannelMerge = listChannelMerge.filter(
          (item) => !existingIds.has(item.id)
        );

        listChannelMergeInfo = [
          ...listChannelMergeInfo,
          ...filteredListChannelMerge,
        ];
      }

      listChannelMergeInfo.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setListChannelMerge(listChannelMergeInfo);
      listRef.current = listChannelMergeInfo;
      setOnRequest(false);
    }
  }, [listChannel]);

  return (
    <SafeAreaView
      edges={["bottom"]}
      className="flex-1"
      style={{ backgroundColor: "#fffafa" }}
    >
      <View>
        {isLoadError && <Text>Hệ thống bị gián đoạn, vui lòng thử lại</Text>}
        {listChannelMerge && (
          <FlatList
            data={listChannelMerge || emptyList}
            contentContainerStyle={{
              alignItems: "center",
              marginTop: 20,
              paddingBottom: 40,
            }}
            ListFooterComponent={() =>
              hasNext ? (
                <View className="items-center mb-100">
                  <Button
                    loading={onRequest}
                    disabled={onRequest}
                    onPress={() => {
                      if (socket) {
                        socket.emit("regisListChannel", {
                          pageState: pageState,
                          pageSize: 5,
                        });
                      }
                    }}
                    mode="text"
                  >
                    Thêm lịch sử tin nhắn
                  </Button>
                </View>
              ) : null
            }
            keyExtractor={(item) => `${item?.id}`}
            renderItem={({ item }) => <PreviewCardChat item={item} />}
            ItemSeparatorComponent={() => (
              <Divider
                style={{
                  height: 0,
                  marginVertical: 10,
                  backgroundColor: "#b1b1b1",
                }}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ListChatChannelPage;
