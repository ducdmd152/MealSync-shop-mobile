import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import CONSTANTS from "@/constants/data";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import useGlobalHeaderPage from "@/hooks/states/useGlobalHeaderPage";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io, { Socket } from "socket.io-client"; // Import the types for socket.io

const Notifications = () => {
  const globalHeaderPage = useGlobalHeaderPage();
  useFocusEffect(
    React.useCallback(() => {
      globalHeaderPage.setIsNotiPageFocusing(true);
      return () => {
        globalHeaderPage.setIsNotiPageFocusing(false);
      };
    }, [])
  );
  const [socket, setSocket] = useState<Socket | null>(null); // Use Socket type from socket.io-client
  const initializeSocket = async () => {
    try {
      const token = await AsyncStorage.getItem("@token"); // Retrieve token from AsyncStorage

      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return;
      }

      // Connect to the server with JWT authentication
      const newSocket = io("wss://socketio.mealsync.org:443", {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
      });

      // Listen for notifications from the server
      newSocket.on("notification", (message: any) => {
        try {
          console.log(
            message,
            " message websockettttttttttttttttttttttttttttttttttttt"
          );
          // showToastable({
          //   renderContent: () => (
          //     <NotifyFisebaseForegroundItem {...message} />
          //   ),
          // });
        } catch (err) {
          console.error("Failed to show toastable:", err);
        }
      });

      // Handle connection errors
      newSocket.on("connect_error", (error: Error) => {
        console.error("Connection Error:", error);
        Alert.alert("Connection Error", error.message);
      });

      // Save socket instance for cleanup
      setSocket(newSocket);
    } catch (error) {
      console.log("Error retrieving token:", error);
      Alert.alert("Error", "Failed to retrieve token. Please log in again.");
    }
  };
  useEffect(() => {
    // Function to initialize socket connection with token from AsyncStorage

    initializeSocket();

    // Cleanup function to disconnect the socket on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []); // Empty dependency array to run only once on mount
  return (
    <ScrollView style={{ flexGrow: 1 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {}}
          className={`p-3 pt-3 bg-white border-b-[0.5px] border-gray-200 ${
            index % 2 > 1 && "bg-[#fffbeb]"
          }`}
        >
          <View className="flex-row flex-1 justify-start items-start">
            <View className="self-start border-[1px] border-gray-200 mr-2 ml-[-2px] rounded-full p-[1px] overflow-hidden mb-1">
              <Image
                source={{
                  uri: CONSTANTS.url.nofi_icon,
                }}
                resizeMode="cover"
                className="h-[40px] w-[40px] opacity-85"
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-[14px] font-semibold mt-[-2px]"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {`It is a long established fact that`}
              </Text>
              <Text
                className="text-[12px] italic mt-[2px] mb-[2px]"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {`It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.`}
              </Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-[11px] italic text-gray-500 ">
                    {dayjs("2000-10-31T01:30:00.000-05:00")
                      .local()
                      .format("HH:mm - DD/MM/YYYY")}{" "}
                  </Text>
                  {/* <Text className="text-[11px] italic text-gray-500 ">
                    Số dư sau giao dịch:{" "}
                    {utilService.formatPrice(transaction.totalAmountAfter)}
                    {"₫"}
                  </Text> */}
                </View>
                {/* <Text
                  className={`text-[11px] italic text-gray-500 ${
                    transaction.amount > 0 ? "text-green-600" : "text-red-700"
                  } font-semibold`}
                >
                  {transaction.amount > 0 ? "+" : "-"}
                  {utilService.formatPrice(Math.abs(transaction.amount))}
                  {"₫"}
                </Text> */}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Notifications;
