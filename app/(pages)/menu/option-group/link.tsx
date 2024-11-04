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
import { router, useFocusEffect } from "expo-router";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import { ShopCategoryModel } from "@/types/models/ShopCategoryModel";
import FetchResponse from "@/types/responses/FetchResponse";
import { endpoints } from "@/services/api-services/api-service-instances";
import apiClient from "@/services/api-services/api-client";
import FoodModel from "@/types/models/FoodModel";
import APICommonResponse from "@/types/responses/APICommonResponse";
import { RefreshControl } from "react-native-gesture-handler";
import { showMessage, hideMessage } from "react-native-flash-message";
import { useToast } from "react-native-toast-notifications";
import ValueResponse from "@/types/responses/ValueReponse";
import FoodDetailModel from "@/types/models/FoodDetailModel";
import useModelState from "@/hooks/states/useModelState";
import usePathState from "@/hooks/states/usePathState";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";

const initialCategories = [
  { id: 1, name: "Ăn sáng", items: 2, isCollapsible: true },
  { id: 2, name: "Ăn trưa", items: 2, isCollapsible: true },
  { id: 3, name: "Ăn tối", items: 2, isCollapsible: true },
];

interface FoodListResponse extends APICommonResponse {
  value: ShopCategoryModel[];
}
interface FoodListQuery {}
interface ExtendCategoryModel extends ShopCategoryModel {
  isCollapsible: boolean;
}
const OptionGroupLink = () => {
  const setMenuSessionIndex = usePathState(
    (state) => state.setMenuSessionIndex
  );
  const toast = useToast();
  const [query, setQuery] = useState<FoodListQuery>({} as FoodListQuery);
  const [extendCategories, setExtendCategories] = useState<
    ExtendCategoryModel[]
  >([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const { notFoundInfo, setNotFoundInfo } = usePathState();
  const optionGroupModel = useModelState((state) => state.optionGroupModel);
  const [linkedIdList, setLinkedIdList] = useState<number[]>(
    (optionGroupModel.foods || []).map((item) => item.id)
  );
  const [linkingIdList, setLinkingIdList] = useState<number[]>([]);

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
      // toast.show("Cập nhật thứ tự thành công!", {
      //   type: "success",
      //   duration: 2000,
      // });
    } catch (error: any) {
      setExtendCategories(prevExtendCategories);
      refetch();
      toast.show("Yêu cầu bị từ chối, vui lòng thử lại.", {
        type: "danger",
        duration: 5000,
      });
      // Alert.alert("Lỗi", "Yêu cầu bị từ chối, vui lòng thử lại.");
    } finally {
    }
  };

  const handleLinkToggle = (isToLink: boolean, food: FoodModel) => {
    const action = isToLink ? "gỡ liên kết" : "liên kết";

    Alert.alert(
      `Xác nhận ${action}`,
      `Bạn có chắc chắn muốn ${action} món này?`,
      isToLink
        ? [
            {
              text: "Đồng ý",
              onPress: async () => {
                setLinkingIdList([...linkingIdList, food.id]);
                const oldLinkedIdList = linkedIdList;
                setLinkedIdList([...linkedIdList, food.id]);
                console.log({
                  optionGroupId: optionGroupModel.id,
                  foodId: food.id,
                });
                try {
                  const response = await apiClient.post(
                    "shop-owner/option-group/link-food",
                    {
                      optionGroupId: optionGroupModel.id,
                      foodId: food.id,
                    }
                  );

                  toast.show(`Đã thêm vào ${food.name}!`, {
                    type: "success",
                    duration: 2000,
                  });

                  // router.replace("/menu/option-group/link");
                } catch (error: any) {
                  setLinkedIdList(oldLinkedIdList);
                  console.log(error);
                  if (error.response && error.response.status === 500) {
                    Alert.alert("Xảy ra lỗi", "Vui lòng thử lại!");
                  } else
                    Alert.alert(
                      "Xảy ra lỗi",
                      error?.response?.data?.error?.message ||
                        "Vui lòng thử lại!"
                    );
                } finally {
                  setLinkingIdList(linkingIdList.filter((id) => id != food.id));
                }
              },
            },
            {
              text: "Hủy",
            },
          ]
        : [
            {
              text: "Hủy",
              // style: "cancel",
            },
            {
              text: "Đồng ý",
              onPress: async () => {
                setLinkingIdList([...linkingIdList, food.id]);
                const oldLinkedIdList = linkedIdList;
                setLinkedIdList(linkedIdList.filter((id) => id != food.id));
                try {
                  const response = await apiClient.delete(
                    "shop-owner/option-group/unlink-food",
                    {
                      data: {
                        optionGroupId: optionGroupModel.id,
                        foodId: food.id,
                      },
                    }
                  );

                  toast.show(`Đã gỡ khỏi ${food.name}!`, {
                    type: "success",
                    duration: 2000,
                  });

                  // router.replace("/menu/option-group/link");
                } catch (error: any) {
                  setLinkedIdList(oldLinkedIdList);
                  if (error.response && error.response.status === 500) {
                    Alert.alert("Xảy ra lỗi", "Vui lòng thử lại!");
                  } else
                    Alert.alert(
                      "Xảy ra lỗi",
                      error?.response?.data?.error?.message ||
                        "Vui lòng thử lại!"
                    );
                } finally {
                  setLinkingIdList(linkingIdList.filter((id) => id != food.id));
                }
              },
            },
          ]
    );
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

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [])
  );

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
          // onLongPress={drag}
        >
          <View>
            <View className="flex-row items-center gap-x-2">
              <Text className="font-bold text-lg text-gray-800">
                {item.name}
              </Text>
              <Text className="text-gray-700 text-sm">
                {item.foods?.length} món
              </Text>
            </View>
            {/* <CustomButton
              title="Chỉnh sửa danh mục"
              handlePress={() => {
                router.push("/menu/category/update");
              }}
              containerStyleClasses="bg-white border-gray-200 border-2 h-[26px] px-[8px]"
              textStyleClasses="text-gray-700 text-[10px] mt-[-3.5px] text-[#227B94]"
            /> */}
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
                <View className="flex-row items-center justify-between gap-2">
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
                        className="text-md font-psemibold mt-[-2px] text-gray-600"
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

                  <TouchableOpacity
                    onPress={() =>
                      handleLinkToggle(
                        !linkedIdList.some((id) => food.id == id),
                        food
                      )
                    }
                    className={`rounded-md items-center justify-center px-[6px] py-[2.2px] ${
                      linkedIdList.some((id) => food.id == id)
                        ? "bg-red-500"
                        : "bg-[#227B94]"
                    } ${
                      linkingIdList.some((id) => food.id == id)
                        ? " opacity-50"
                        : " "
                    }`}
                    disabled={linkingIdList.some((id) => food.id == id)}
                  >
                    <Text className="text-[13.5px] text-white">
                      {linkedIdList.some((id) => food.id == id)
                        ? "Gỡ liên kết"
                        : "Liên kết"}
                    </Text>
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
    <PageLayoutWrapper isScroll={false}>
      <View className="bg-gray-200 p-4 ">
        <Text className="text-[16px] font-semibold text-gray-800 ">
          Liên kết "{optionGroupModel.title}" với thực đơn chính
        </Text>
      </View>

      <View className="flex-1 bg-white text-black relative ">
        <View className="w-full flex-1 gap-2 p-4 pt-3 pb-0 bg-secondar">
          <View className="w-full ">
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
          <Text className="text-[14px] text-gray-800 mt-2 text-right italic ">
            {linkedIdList.length || 0} món đã được liên kết
          </Text>
          <View
            className="gap-y-2  flex-1 "
            style={{ width: "100%", flexGrow: 1 }}
          >
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
      </View>
      <View className="p-4">
        <CustomButton
          title="Hoàn tất"
          containerStyleClasses="bg-primary"
          textStyleClasses="text-white"
          handlePress={() => {
            setMenuSessionIndex(1);
            router.push("/menu");
          }}
        />
      </View>
    </PageLayoutWrapper>
  );
};

export default OptionGroupLink;
