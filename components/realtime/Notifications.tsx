import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
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
import { ActivityIndicator } from "react-native";
import { FlatList } from "react-native-gesture-handler";
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
const INFINITE_LOAD_SIZE = 10;
const Notifications = () => {
  const globalHeaderPage = useGlobalHeaderPage();
  const globalNotiState = useGlobalNotiState();
  const globalOrderDetailPageState = useOrderDetailPageState();
  const [infiniteSize, setInfitieSize] = useState(INFINITE_LOAD_SIZE);
  const [isRendering, setIsRendering] = useState(false);
  const [notifications, setNotifications] = useState<NotiModel[]>([]);
  const notiFetcher = useFetchWithRQWithFetchFunc(
    [endpoints.NOTIFICATION_LIST],
    async (): Promise<FetchResponse<NotiModel>> =>
      apiClient
        .get(endpoints.NOTIFICATION_LIST, {
          params: {
            pageIndex: 1,
            pageSize: infiniteSize,
          },
        })
        .then((response) => response.data),
    [infiniteSize]
  );
  const markAsReadAll = async () => {
    try {
      const response = await apiClient.put("notification/mark-all-read");
      console.info("Call API notification/mark-all-read: OKKKKKK!");
    } catch (error: any) {
      console.error("Call API notification/mark-all-read: ", error.response);
    } finally {
    }
  };
  useEffect(() => {
    if (globalHeaderPage.isNotiPageFocusing) setInfitieSize(INFINITE_LOAD_SIZE);
    else markAsReadAll();
    // console.log(
    //   "globalHeaderPage.isChattingFocusing: ",
    //   globalHeaderPage.isNotiPageFocusing
    // );
  }, [globalHeaderPage.isNotiPageFocusing]);
  useEffect(() => {
    if (globalHeaderPage.isNotiPageFocusing) notiFetcher.refetch();
  }, [globalNotiState.toggleChangingFlag]);

  useEffect(() => {
    if (notiFetcher.isFetched) {
      setIsRendering(true);
      setTimeout(() => {
        setIsRendering(false);
      }, 1500);
    }
  }, [notiFetcher.isFetched]);
  useEffect(() => {
    if (notiFetcher.data?.value.items)
      setNotifications(
        notiFetcher.data.value.items.map((item) => {
          const already = notifications.find((noti) => noti.id == item.id);
          return already || item;
        })
      );
  }, [notiFetcher.data?.value.items]);
  useFocusEffect(
    React.useCallback(() => {
      globalHeaderPage.setIsNotiPageFocusing(true);
      return () => {
        setNotifications(
          notifications.map((item) => ({ ...item, isRead: true }))
        );
        globalHeaderPage.setIsNotiPageFocusing(false);
      };
    }, [])
  );
  const renderItem = ({ item, index }: { item: NotiModel; index: number }) => (
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
      style={{
        backgroundColor: item.isRead ? "#fff" : "#fffbeb",
        ...(index == 0 ? { paddingTop: 20 } : {}),
      }}
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
                {dayjs(item.createdDate).local().format("HH:mm - DD/MM/YYYY")}{" "}
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
  );

  return (
    <FlatList
      style={{ flexGrow: 1, backgroundColor: "white" }}
      // data={notiFetcher.data?.value.items || []}
      data={notifications}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.id.toString()}
      onEndReached={() => {
        if (
          notiFetcher.isFetching ||
          isRendering ||
          (notiFetcher.data && !notiFetcher.data.value.hasNext)
        )
          return;
        setInfitieSize(infiniteSize + INFINITE_LOAD_SIZE);
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        <View className="p-3">
          <ActivityIndicator
            animating={notiFetcher.isFetching || isRendering}
            color="#FCF450"
            size={40}
          />
        </View>
      }
    />
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
      <View className="min-h-20 bg-gray-200">
        <ActivityIndicator
          animating={notiFetcher.isFetching || isRendering}
          color="#FCF450"
        />
      </View>
    </ScrollView>
  );
};

export default Notifications;
