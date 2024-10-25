import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/themes/useColorScheme";
import TabHeader from "@/components/navigation/TabHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
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
            paddingBottom: 12,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "home" : "home-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="order"
          options={{
            title: "Đơn hàng",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "archive" : "archive-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="delivery-package"
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
          name="menu"
          options={{
            title: "Thực đơn",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "fast-food" : "fast-food-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: "Cửa hàng",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "storefront" : "storefront-outline"}
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
        {/* TEMPLATE ONLY */}
        <Tabs.Screen
          name="index-template"
          options={{
            title: "Home-template",
            headerShown: false,
            href: null,
            tabBarStyle: { display: "none" },
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "home" : "home-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore-template"
          options={{
            title: "Explorer-template",
            headerShown: false,
            href: null,
            tabBarStyle: { display: "none" },
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "code-slash" : "code-slash-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
