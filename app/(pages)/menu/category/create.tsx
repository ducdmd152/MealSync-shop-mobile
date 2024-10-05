import { View, Text } from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import { CRUD } from "@/constants/operations";
import { router } from "expo-router";
import FormField from "@/components/custom/FormFieldCustom";
import CustomButton from "@/components/custom/CustomButton";

const CategoryPage = () => {
  return (
    <PageLayoutWrapper isScroll={false}>
      <View className="p-4 justify-between">
        <FormField
          title="Tên danh mục"
          value=""
          placeholder="Nhập tên danh mục..."
          handleChangeText={(text) => {}}
          otherStyleClasses=""
          otherInputStyleClasses="border-gray-300 h-14"
        />
        <View className="items-center justify-center mt-2">
          <CustomButton
            title="Thêm danh mục"
            handlePress={() => {}}
            containerStyleClasses="w-full h-[52px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10"
            // iconLeft={
            //   <Ionicons name="add-circle-outline" size={21} color="white" />
            // }
            textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
          />
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default CategoryPage;
