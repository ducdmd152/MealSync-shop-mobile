import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/themes/useColorScheme";
import TabHeader from "@/components/navigation/TabHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeliveryStaffLayout() {
  const colorScheme = useColorScheme();

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
