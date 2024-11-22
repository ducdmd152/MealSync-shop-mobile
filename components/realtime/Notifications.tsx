import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import CONSTANTS from "@/constants/data";
import dayjs from "dayjs";
import { router, useFocusEffect } from "expo-router";
import useGlobalHeaderPage from "@/hooks/states/useGlobalHeaderPage";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io, { Fetch, Socket } from "socket.io-client"; // Import the types for socket.io
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import { endpoints } from "@/services/api-services/api-service-instances";
import apiClient from "@/services/api-services/api-client";
import FetchResponse from "@/types/responses/FetchResponse";
import useGlobalNotiState from "@/hooks/states/useGlobalNotiState";
import useOrderDetailPageState from "@/hooks/states/useOrderDetailPageState";
import OrderDetailModel from "@/types/models/OrderDetailModel";
interface NotiModel {
  id: number;
  accountId: number;
  referenceId: number;
  imageUrl: string;
  title: string;
  content: string;
  // data: string; // Chuỗi JSON, có thể cần parse thành đối tượng nếu cần dùng chi tiết
  entityType: number;
  isRead: boolean;
  createdDate: string;
}
enum EntityTypes {
  Order = 1,
}
const Notifications = () => {
  const globalHeaderPage = useGlobalHeaderPage();
  const globalNotiState = useGlobalNotiState();
  const globalOrderDetailPageState = useOrderDetailPageState();
  const notiFetcher = useFetchWithRQWithFetchFunc(
    [endpoints.NOTIFICATION_LIST],
    async (): Promise<FetchResponse<NotiModel>> =>
      apiClient
        .get(endpoints.NOTIFICATION_LIST, {
          params: {
            pageIndex: 1,
            pageSize: 100_000_000,
          },
        })
        .then((response) => response.data),
    []
  );
  useEffect(() => {
    if (globalHeaderPage.isNotiPageFocusing) notiFetcher.refetch();
    // console.log(
    //   "globalHeaderPage.isChattingFocusing: ",
    //   globalHeaderPage.isNotiPageFocusing
    // );
  }, [globalHeaderPage.isNotiPageFocusing]);
  useEffect(() => {
    if (globalHeaderPage.isNotiPageFocusing) notiFetcher.refetch();
  }, [globalNotiState.toggleChangingFlag]);

  useFocusEffect(
    React.useCallback(() => {
      globalHeaderPage.setIsNotiPageFocusing(true);
      return () => {
        globalHeaderPage.setIsNotiPageFocusing(false);
      };
    }, [])
  );

  return (
    <ScrollView
      style={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          tintColor={"#FCF450"}
          onRefresh={() => {}}
          refreshing={notiFetcher.isFetching}
        />
      }
    >
      {notiFetcher.data?.value.items.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => {
            if (item.entityType == EntityTypes.Order) {
              globalOrderDetailPageState.setOrder({} as OrderDetailModel);
              globalOrderDetailPageState.setId(item.referenceId);
              router.push("/order/details");
            }
          }}
          className={`p-3 px-4 bg-white border-b-[0.5px] border-gray-200 `}
          style={{ backgroundColor: item.isRead ? "#fff" : "#fffbeb" }}
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
                {item.title +
                  (item.entityType == EntityTypes.Order
                    ? ` MS-${item.referenceId}`
                    : "")}
              </Text>
              <Text
                className="text-[12px] italic mt-[2px] mb-[2px]"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.content}
              </Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-[11px] italic text-gray-500 ">
                    {dayjs(item.createdDate)
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
