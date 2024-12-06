import { Tabs, useFocusEffect, useNavigation } from "expo-router";
import React, { useEffect } from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/themes/useColorScheme";
import TabHeader from "@/components/navigation/TabHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import { endpoints } from "@/services/api-services/api-service-instances";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import {
  ShopDeliveryStaffModel,
  ShopDeliveryStaffStatus,
} from "@/types/models/StaffInfoModel";
import apiClient from "@/services/api-services/api-client";
import sessionService from "@/services/session-service";

export default function DeliveryStaffLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const staffAccount = useFetchWithRQWithFetchFunc(
    [endpoints.STAFF_INFO],
    async (): Promise<FetchValueResponse<ShopDeliveryStaffModel>> =>
      apiClient.get(endpoints.STAFF_INFO).then((response) => response.data),
    []
  );
  useEffect(() => {
    if (staffAccount.data?.value.accountStatus == ShopDeliveryStaffStatus.Off) {
      sessionService.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: "index" }],
      });
    }
  }, [staffAccount.data?.value]);
  useFocusEffect(
    React.useCallback(() => {
      if (staffAccount.isFetched) staffAccount.refetch();
    }, [])
  );
  return (
    <SafeAreaView className="h-full">
      <Tabs
        screenOptions={{
          header: () => <TabHeader />,
          tabBarActiveTintColor: "#DF4830",
          tabBarInactiveTintColor: "#686D76",
          // tabBarShowLabel: false,
          headerShown: true,
          tabBarStyle: {
            height: 68,
            paddingBottom: 6,
            paddingTop: 7,
          },
        }}
      >
        <Tabs.Screen
          name="staff-home"
          options={{
            title: "Giao hàng",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "cube" : "cube-outline"}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="staff-account"
          options={{
            title: "Tài khoản",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "person" : "person-outline"}
                color={color}
              />
            ),
          }}
        />
        {/* <Tabs.Screen
          name="staff-profile"
          options={{
            title: "Hồ sơ của bạn",
            href: null,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "person" : "person-outline"}
                color={color}
              />
            ),
          }}
        /> */}
        <Tabs.Screen
          name="notification"
          options={{
            title: "Thông báo",
            href: null,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "notifications" : "notifications-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chatting"
          options={{
            title: "Tin nhắn",
            href: null,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
