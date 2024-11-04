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
          name="shop/review"
          options={{ headerTitle: "Lượt đánh giá" }}
        />
        <Stack.Screen
          name="shop/statistics"
          options={{ headerTitle: "Hiệu suất bán hàng" }}
        />
        <Stack.Screen
          name="shop/setting"
          options={{ headerTitle: "Cài đặt cửa hàng" }}
        />
        <Stack.Screen
          name="shop/balance"
          options={{
            headerTitle: "Quản lí số dư",
          }}
        />
        <Stack.Screen
          name="shop/withdrawal"
          options={{ headerTitle: "Yêu cầu rút tiền" }}
        />
        <Stack.Screen
          name="shop/account"
          options={{ headerTitle: "Tài khoản" }}
        />
        <Stack.Screen
          name="menu/category/create"
          options={{ headerTitle: "Thêm mới danh mục" }}
        />
        <Stack.Screen
          name="menu/category/update"
          options={{ headerTitle: "Chỉnh sửa danh mục" }}
        />
        <Stack.Screen
          name="menu/food/create"
          options={{ headerTitle: "Tạo mới sản phẩm" }}
        />
        <Stack.Screen
          name="menu/food/update"
          options={{ headerTitle: "Cập nhật sản phẩm" }}
        />
        <Stack.Screen
          name="menu/option-group/create"
          options={{ headerTitle: "Thêm nhóm lựa chọn" }}
        />
        <Stack.Screen
          name="menu/option-group/update"
          options={{ headerTitle: "Cập nhật nhóm lựa chọn" }}
        />
        <Stack.Screen
          name="menu/option-group/link"
          options={{ headerTitle: "Liên kết thực đơn chính" }}
        />
        <Stack.Screen
          name="delivery-package-group/create"
          options={{ headerTitle: "Tạo phân công giao hàng" }}
        />
        <Stack.Screen
          name="delivery-package-group/update"
          options={{ headerTitle: "Chỉnh sửa phân công giao hàng" }}
        />
        <Stack.Screen
          name="promotion/create"
          options={{ headerTitle: "Tạo mới khuyến mãi" }}
        />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default PageLayout;
