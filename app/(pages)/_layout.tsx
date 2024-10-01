import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const PageLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="shop/profile"
          options={{ headerTitle: "Hồ sơ cửa hàng" }}
        />
        <Stack.Screen
          name="shop/promotion"
          options={{ headerTitle: "Quản lí khuyến mãi" }}
        />
        <Stack.Screen
          name="review"
          options={{ headerTitle: "Lượt đánh giá" }}
        />
        <Stack.Screen
          name="statistics"
          options={{ headerTitle: "Hiệu suất bán hàng" }}
        />
        <Stack.Screen
          name="setting"
          options={{ headerTitle: "Cài đặt cửa hàng" }}
        />
        <Stack.Screen
          name="balance"
          options={{
            headerTitle: "Quản lí số dư",
          }}
        />
        <Stack.Screen
          name="withdrawal"
          options={{ headerTitle: "Yêu cầu rút tiền" }}
        />
        <Stack.Screen name="account" options={{ headerTitle: "Tài khoản" }} />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default PageLayout;
