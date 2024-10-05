import { View, Text } from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import { CRUD } from "@/constants/operations";
import { router } from "expo-router";

const CategoryPage = () => {
  return (
    <PageLayoutWrapper isScroll={false}>
      <View className="p-4"></View>
    </PageLayoutWrapper>
  );
};

export default CategoryPage;
