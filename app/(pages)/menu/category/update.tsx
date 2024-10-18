import { View, Text, Image, Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import { CRUD } from "@/constants/operations";
import { router, useFocusEffect } from "expo-router";
import FormField from "@/components/custom/FormFieldCustom";
import CustomButton from "@/components/custom/CustomButton";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import usePathState from "@/hooks/states/usePathState";
import useModelState from "@/hooks/states/useModelState";
import apiClient from "@/services/api-services/api-client";
import ValueResponse from "@/types/responses/ValueReponse";
import FoodDetailModel from "@/types/models/FoodDetailModel";
import { ShopCategoryModel } from "@/types/models/ShopCategoryModel";

const CategoryUpdate = () => {
  const shopCategoryModel = useModelState((state) => state.shopCategoryModel);
  const [categoryName, setCategoryName] = useState(shopCategoryModel.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setFoodDetailModel, setShopCategoryModel } = useModelState();
  const { notFoundInfo, setNotFoundInfo } = usePathState();
  const isFirstTime = useRef(true);
  const refetch = async () => {
    console.log("refetching...");
    try {
      const response = await apiClient.get<ValueResponse<ShopCategoryModel>>(
        `shop-owner/category/${shopCategoryModel.id}`
      );
      setShopCategoryModel({ ...response.data.value });
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        Alert.alert("Oops!", "Danh mục này không còn tồn tại!");
        router.replace("/menu");
      } else {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Hệ thống gặp lỗi, vui lòng thử lại sau!"
        );
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isFirstTime.current) isFirstTime.current = false;
      else refetch();
    }, [])
  );
  useEffect(() => {
    setCategoryName(shopCategoryModel.name);
  }, [shopCategoryModel]);

  const handleUpdateCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Lỗi nhập liệu", "Vui lòng nhập tên danh mục");
      return;
    }

    const data = {
      ...shopCategoryModel,
      name: categoryName,
    };

    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        "shop-owner/category/" + shopCategoryModel.id,
        data
      );
      const { value, isSuccess, error } = response.data;

      if (isSuccess) {
        Alert.alert("Thành công", `Danh mục "${value.name}" đã được cập nhật!`);
        router.push("/menu");
      } else {
        Alert.alert(
          "Thông báo",
          error.message || "Có lỗi xảy ra khi cập danh mục!"
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

  const onDelete = async () => {
    Alert.alert("Xác nhận thay đổi", `Bạn có chắc xóa danh mục này không?`, [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            const response = await apiClient.delete(
              `shop-owner/category/${shopCategoryModel.id}`
            );
            Alert.alert(
              "Hoàn tất",
              `Đã xóa danh mục ${shopCategoryModel.name}!`
            );
            router.replace("/menu");
          } catch (error: any) {
            if (error.response && error.response.status === 404) {
              Alert.alert("Oops!", "Danh mục này không còn tồn tại!");
              router.replace("/menu");
            } else {
              Alert.alert(
                "Oops!",
                error?.response?.data?.error?.message ||
                  "Hệ thống gặp lỗi, vui lòng thử lại sau!"
              );
              refetch();
            }
          }
        },
      },
    ]);
  };
  return (
    <PageLayoutWrapper isScroll={false}>
      <View className="flex-1 p-4 justify-between">
        <View>
          <FormField
            title="Tên danh mục"
            value={categoryName}
            placeholder="Nhập tên danh mục..."
            handleChangeText={(text) => setCategoryName(text)}
            otherStyleClasses=""
            otherInputStyleClasses="border-gray-300 h-14"
          />
          <Text className="text-md text-gray-700 italic mt-3 pb-1">
            {shopCategoryModel.foods?.length} sản phẩm thuộc danh mục này
          </Text>
          <ScrollView style={{ width: "100%", height: "60%" }}>
            <View className="gap-y-2 mt-2">
              {shopCategoryModel.foods?.map((food) => (
                <View
                  key={food.id}
                  className="p-4 pt-3 bg-white border-2 border-gray-300 rounded-lg"
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-row justify-start items-start gap-2 flex-1">
                      <Image
                        source={{
                          uri:
                            food.imageUrl || "https://via.placeholder.com/40", // Fallback image
                        }}
                        resizeMode="cover"
                        className="h-[36px] w-[40px] rounded-md opacity-85"
                      />
                      <View className="flex-1">
                        <Text
                          className="text-md font-psemibold mt-[-2px] text-gray-600"
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {food.name}
                        </Text>
                        <Text className="text-md italic text-gray-500 mt-[-2px]">
                          {food.price?.toLocaleString()}đ
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row gap-2 items-start">
                      {/* <Text className="bg-blue-100 text-blue-800 text-[12.5px] font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        {food.status == 1
                          ? food.isSoldOut
                            ? "Hết hàng"
                            : "Còn hàng"
                          : "Tạm ẩn"}
                      </Text> */}
                      <TouchableOpacity
                        onPress={async () => {
                          setNotFoundInfo(
                            notFoundInfo.message,
                            "/menu",
                            notFoundInfo.linkDesc
                          );
                          try {
                            const response = await apiClient.get<
                              ValueResponse<FoodDetailModel>
                            >(`shop-owner/food/${food.id}/detail`);
                            setFoodDetailModel({ ...response.data.value });
                            router.push("/menu/food/update");
                            // console.log("Food Detail model: ", foodDetailModel);
                          } catch (error: any) {
                            if (
                              error.response &&
                              error.response.status === 404
                            ) {
                              Alert.alert("Oops!", "Món này không tồn tại!");
                            } else {
                              Alert.alert(
                                "Oops!",
                                error?.response?.data?.error?.message ||
                                  "Hệ thống đang bảo trì, vui lòng thử lại sau!"
                              );
                            }
                          }
                        }}
                        className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                      >
                        <Text className="text-[13.5px] text-white">
                          Chỉnh sửa
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* <View className="flex-row justify-between items-center gap-2 pt-2">
                    <Text className="text-gray-500 italic text-[12px] text-secondary-200">
                      100 đơn cần xử lí trong 2h tới
                    </Text>
                    <TouchableOpacity
                      onPress={async () => {
                        setNotFoundInfo(
                          notFoundInfo.message,
                          "/menu",
                          notFoundInfo.linkDesc
                        );
                        try {
                          const response = await apiClient.get<
                            ValueResponse<FoodDetailModel>
                          >(`shop-owner/food/${food.id}/detail`);
                          setFoodDetailModel({ ...response.data.value });
                          router.push("/menu/food/update");
                          // console.log("Food Detail model: ", foodDetailModel);
                        } catch (error: any) {
                          if (error.response && error.response.status === 404) {
                            Alert.alert("Oops!", "Món này không tồn tại!");
                          } else {
                            Alert.alert(
                              "Oops!",
                              error?.response?.data?.error?.message ||
                                "Hệ thống đang bảo trì, vui lòng thử lại sau!"
                            );
                          }
                        }
                      }}
                      className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                    >
                      <Text className="text-[13.5px] text-white">
                        Chỉnh sửa
                      </Text>
                    </TouchableOpacity>
                  </View> */}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <View className="items-center justify-center pt-1">
          <CustomButton
            title="Hoàn tất chỉnh sửa"
            isLoading={isSubmitting}
            handlePress={() => handleUpdateCategory()}
            containerStyleClasses="w-full h-[52px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10"
            // iconLeft={
            //   <Ionicons name="add-circle-outline" size={21} color="white" />
            // }
            textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
          />
          <CustomButton
            title="Xóa danh mục này"
            handlePress={() => onDelete()}
            isDisabled={
              shopCategoryModel.foods && shopCategoryModel.foods?.length > 0
            }
            containerStyleClasses={`mt-2 w-full h-[48px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10 border-secondary bg-white relative ${
              shopCategoryModel.foods?.length && "border-gray-400"
            }`}
            // iconLeft={
            //   <Ionicons name="add-circle-outline" size={21} color="white" />
            // }
            flexibleComponent={
              shopCategoryModel.foods?.length ? (
                <Text className="absolute bottom-1 text-[10px] text-gray-500 italic">
                  Danh mục chỉ có thể xóa khi không chứa sản phẩm nào
                </Text>
              ) : (
                <Text></Text>
              )
            }
            textStyleClasses={`text-[16px] text-gray-900 ml-1 text-secondary ${
              shopCategoryModel.foods?.length && "mb-3 text-gray-500"
            }`}
          />
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default CategoryUpdate;
