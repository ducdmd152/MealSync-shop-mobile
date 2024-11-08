import { View, Text, Alert } from "react-native";
import React, { useState } from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import { router } from "expo-router";
import FormField from "@/components/custom/FormFieldCustom";
import CustomButton from "@/components/custom/CustomButton";
import apiClient from "@/services/api-services/api-client";

const CategoryPage = () => {
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Lỗi nhập liệu", "Vui lòng nhập tên danh mục");
      return;
    }

    const data = {
      name: categoryName,
      description: "",
      imageUrl: null,
    };

    try {
      setIsSubmitting(true);
      const response = await apiClient.post("shop-owner/category/create", data);
      const { value, isSuccess, error } = response.data;

      if (isSuccess) {
        Alert.alert("Thành công", `Danh mục "${value.name}" đã được thêm!`);
        router.replace("/menu");
      } else {
        Alert.alert(
          "Thông báo",
          error.message || "Có lỗi xảy ra khi thêm danh mục!"
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.response?.data?.error?.message ||
          "Hệ thống đang bảo trì, vui lòng thử lại sau."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayoutWrapper isScroll={false}>
      <View className="p-4 justify-between">
        <FormField
          title="Tên danh mục"
          value={categoryName}
          placeholder="Nhập tên danh mục..."
          handleChangeText={(text) => setCategoryName(text)}
          otherStyleClasses=""
          isRequired={true}
          otherInputStyleClasses="border-gray-300 h-14"
        />
        <View className="items-center justify-center mt-2">
          <CustomButton
            title={"Thêm danh mục"}
            handlePress={handleAddCategory}
            containerStyleClasses="w-full h-[52px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-semibold z-10"
            textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
            isLoading={isSubmitting}
          />
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default CategoryPage;
