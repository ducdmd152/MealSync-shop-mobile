import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React from "react";
import CONSTANTS from "@/constants/data";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import useGlobalHeaderPage from "@/hooks/states/useGlobalHeaderPage";

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
