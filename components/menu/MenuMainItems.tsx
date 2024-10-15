import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Searchbar } from "react-native-paper";
import Collapsible from "react-native-collapsible";
import { Tab } from "react-native-elements";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { BottomSheet } from "@rneui/themed";
import { router } from "expo-router";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import { CategoryModel } from "@/types/models/CategoryModel";
import FetchResponse from "@/types/responses/FetchResponse";
import { endpoints } from "@/services/api-services/api-service-instances";
import apiClient from "@/services/api-services/api-client";
import FoodModel from "@/types/models/FoodModel";
import APICommonResponse from "@/types/responses/APICommonResponse";
import { RefreshControl } from "react-native-gesture-handler";
import { showMessage, hideMessage } from "react-native-flash-message";
import { useToast } from "react-native-toast-notifications";

const initialCategories = [
  { id: 1, name: "Ăn sáng", items: 2, isCollapsible: true },
  { id: 2, name: "Ăn trưa", items: 2, isCollapsible: true },
  { id: 3, name: "Ăn tối", items: 2, isCollapsible: true },
];

interface FoodListResponse extends APICommonResponse {
  value: CategoryModel[];
}
interface FoodListQuery {}
interface ExtendCategoryModel extends CategoryModel {
  isCollapsible: boolean;
}
const MenuMainItems = () => {
  const toast = useToast();
  const [query, setQuery] = useState<FoodListQuery>({} as FoodListQuery);
  const [extendCategories, setExtendCategories] = useState<
    ExtendCategoryModel[]
  >([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  // const [categories, setCategories] = useState(initialCategories);

  const onRearrange = async (data: ExtendCategoryModel[]) => {
    const prevExtendCategories = extendCategories;
    setExtendCategories(data);
    try {
      console.log("Update categories order: ", {
        ids: extendCategories.map((category) => category.id),
      });

      const response = await apiClient.put("shop-owner/category/re-arrange", {
        ids: extendCategories.map((category) => category.id),
      });
      const { value, isSuccess, error } = response.data;
      toast.show("Cập nhật thứ tự thành công!", {
        type: "success",
        duration: 2000,
      });
    } catch (error: any) {
      setExtendCategories(prevExtendCategories);
      refetch();
      toast.show("Hệ thống gặp lỗi, vui lòng thử lại.", {
        type: "danger",
        duration: 5000,
      });
      // Alert.alert("Lỗi", "Hệ thống gặp lỗi, vui lòng thử lại.");
    } finally {
    }
  };

  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.FOOD_LIST,
    (): Promise<FoodListResponse> =>
      apiClient.get(endpoints.FOOD_LIST).then((response) => response.data),
    [query]
  );

  useEffect(() => {
    console.log(categories?.value);
    if (categories?.value)
      setExtendCategories(
        categories?.value?.map((category) => ({
          ...category,
          isCollapsible:
            extendCategories.find((cat) => cat.id == category.id)
              ?.isCollapsible || true,
        })) as ExtendCategoryModel[]
      );
  }, [categories]);

  // console.log(extendCategories);
  const renderCategory = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<ExtendCategoryModel>) => {
    // console.log(item.id);
    return (
      <View key={item.id} className="mb-1">
        <TouchableOpacity
          className="flex-row justify-between items-center pr-2 mb-2"
          onPress={() =>
            setExtendCategories(
              extendCategories?.map((cat) =>
                item.id === cat.id
                  ? { ...cat, isCollapsible: !cat.isCollapsible }
                  : cat
              )
            )
          }
          onLongPress={drag}
        >
          <View>
            <View className="flex-row items-center gap-x-2">
              <Text className="font-bold text-lg text-gray-800">
                {item.name}
              </Text>
              <Text className="text-gray-700 text-sm">
                {item.foods.length} món
              </Text>
            </View>
            <CustomButton
              title="Chỉnh sửa danh mục"
              handlePress={() => {
                router.push("/menu/category/update");
              }}
              containerStyleClasses="bg-white border-gray-200 border-2 h-[26px] px-[8px]"
              textStyleClasses="text-gray-700 text-[10px] mt-[-3.5px] text-[#227B94]"
            />
          </View>
          <View className="flex-row items-center gap-x-6">
            {item.isCollapsible ? (
              <Ionicons name="chevron-up-outline" size={21} color="gray" />
            ) : (
              <Ionicons name="chevron-down-outline" size={21} color="gray" />
            )}
          </View>
        </TouchableOpacity>

        <Collapsible collapsed={item.isCollapsible}>
          <View className="gap-y-2 pb-2">
            {item.foods?.map((food) => (
              <View
                key={food.id}
                className="p-4 pt-3 bg-white border-2 border-gray-300 rounded-lg"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-row justify-start items-start gap-2 flex-1">
                    <Image
                      source={{
                        uri: food.imageUrl || "https://via.placeholder.com/40", // Fallback image
                      }}
                      resizeMode="cover"
                      className="h-[36px] w-[40px] rounded-md opacity-85"
                    />
                    <View className="flex-1">
                      <Text
                        className="text-md font-psemibold mt-[-2px]"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {food.name}
                      </Text>
                      <Text className="text-md italic text-gray-500 mt-[-2px]">
                        {food.price.toLocaleString()}đ
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2 items-start">
                    <Text className="bg-blue-100 text-blue-800 text-[12.5px] font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      {food.status == 1
                        ? food.isSoldOut
                          ? "Hết hàng"
                          : "Còn hàng"
                        : "Tạm ẩn"}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center gap-2 pt-2">
                  <Text className="text-gray-500 italic text-[12px] text-secondary-200">
                    100 đơn cần xử lí trong 2h tới
                  </Text>
                  <TouchableOpacity
                    onPress={() => {}}
                    className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                  >
                    <Text className="text-[13.5px] text-white">Chỉnh sửa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Collapsible>

        <View className="border-b-2 border-gray-200"></View>
      </View>
    );
  };

  return (
    <View className="w-full h-full bg-white text-black  relative">
      <View className="absolute w-full items-center justify-center bottom-28 left-0 z-10">
        <CustomButton
          title="Thêm món/danh mục mới"
          handlePress={() => {
            setIsBottomSheetVisible(true);
          }}
          containerStyleClasses="w-[98%] h-[50px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[15px] text-gray-900 ml-1 text-white"
        />
      </View>

      <View className="w-full gap-2 p-4 pt-3">
        <View className="w-full">
          <Searchbar
            style={{
              height: 40,
              // backgroundColor: "white",
              // borderColor: "lightgray",
              // borderWidth: 2,
            }}
            inputStyle={{ minHeight: 0 }}
            placeholder="Nhập tên món..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>
        {/* <ScrollView style={{ width: "100%", flexShrink: 0 }} horizontal={true}>
          <View className="w-full flex-row gap-2 items-center justify-between pb-2 ">
            <Text className="bg-gray-100 rounded-xl px-4 py-2 bg-secondary">
              Tất cả
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Trong khung giờ
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Ngoài khung giờ
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">
              Tạm hết hàng
            </Text>
            <Text className="bg-gray-100 rounded-xl px-4 py-2 ">Đã ẩn</Text>
          </View>
        </ScrollView> */}
        <View className="gap-y-2 pb-[250px]">
          {isLoading && (
            <ActivityIndicator animating={isLoading} color="#FCF450" />
          )}
          <DraggableFlatList
            style={{ width: "100%", flexGrow: 1 }}
            data={extendCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => `category-${item.id}`}
            onDragEnd={({ data }) => {
              onRearrange(data);
            }}
            refreshControl={
              <RefreshControl
                tintColor={"#FCF450"}
                onRefresh={() => {
                  refetch();
                }}
                refreshing={isLoading}
              />
            }
          />
        </View>
      </View>

      <BottomSheet modalProps={{}} isVisible={isBottomSheetVisible}>
        <View className="p-4 bg-white rounded-t-lg min-h-[120px] ">
          <TouchableOpacity
            className="items-center"
            onPress={() => setIsBottomSheetVisible(false)}
          >
            <Ionicons name="chevron-down-outline" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-4"
            onPress={() => {
              setIsBottomSheetVisible(false);
              router.push("/menu/food/create");
            }}
          >
            <Text className="text-lg text-primary font-semibold shadow drop-shadow-lg">
              Thêm món mới
            </Text>
            <Text className="text-sm text-gray-400 italic">
              Ví dụ: trà sữa, bánh ngọt,...
            </Text>
          </TouchableOpacity>
          <View className="border-b-2 border-gray-200"></View>
          <TouchableOpacity
            className="p-4"
            onPress={() => {
              setIsBottomSheetVisible(false);
              router.push("/menu/category/create");
            }}
          >
            <Text className="text-lg text-primary font-semibold">
              Thêm danh mục mới
            </Text>

            <Text className="text-sm text-gray-400 italic">
              Ví dụ: đồ uống, ăn nhanh,...
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default MenuMainItems;
