import CustomButton from "@/components/custom/CustomButton";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import useModelState from "@/hooks/states/useModelState";
import usePathState from "@/hooks/states/usePathState";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import utilService from "@/services/util-service";
import FoodDetailModel from "@/types/models/FoodDetailModel";
import FoodModel from "@/types/models/FoodModel";
import { ShopCategoryModel } from "@/types/models/ShopCategoryModel";
import APICommonResponse from "@/types/responses/APICommonResponse";
import { FetchOnlyListResponse } from "@/types/responses/FetchResponse";
import ValueResponse from "@/types/responses/ValueReponse";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheet } from "@rneui/themed";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import Collapsible from "react-native-collapsible";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { Switch } from "react-native-paper";
import { useToast } from "react-native-toast-notifications";

const initialCategories = [
  { id: 1, name: "Ăn sáng", items: 2, isCollapsible: true },
  { id: 2, name: "Ăn trưa", items: 2, isCollapsible: true },
  { id: 3, name: "Ăn tối", items: 2, isCollapsible: true },
];

interface FoodListResponse extends APICommonResponse {
  value: ShopCategoryModel[];
}
interface FoodListQuery {
  filterMode: number;
}
interface ExtendCategoryModel extends ShopCategoryModel {
  isCollapsible: boolean;
}
const MenuMainItems = ({ beforeGo }: { beforeGo: () => void }) => {
  const toast = useToast();
  const [query, setQuery] = useState<FoodListQuery>({
    filterMode: 0,
  } as FoodListQuery);
  const [extendCategories, setExtendCategories] = useState<
    ExtendCategoryModel[]
  >([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const { setFoodDetailModel, setShopCategoryModel } = useModelState();
  const { notFoundInfo, setNotFoundInfo } = usePathState();
  const [statusingIdList, setStatusingIdList] = useState<number[]>([]);

  // const [categories, setCategories] = useState(initialCategories);

  const onRearrange = async (data: ExtendCategoryModel[]) => {
    const prevExtendCategories = extendCategories;
    setExtendCategories(data);
    try {
      // console.log("Update categories order: ", {
      //   ids: extendCategories.map((category) => category.id),
      // });

      const response = await apiClient.put("shop-owner/category/re-arrange", {
        ids: data.map((category) => category.id),
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
      // Alert.alert("Oops", "Yêu cầu bị từ chối, vui lòng thử lại.");
    } finally {
    }
  };

  const [tmpCategories, setTmpCategories] = useState<ShopCategoryModel[]>([]);
  const {
    data: categories,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.FOOD_LIST,
    (): Promise<FetchOnlyListResponse<ShopCategoryModel>> =>
      apiClient
        .get(endpoints.FOOD_LIST, {
          params: {
            filterMode: query.filterMode,
          },
        })
        .then((response) => response.data),
    [query]
  );
  useEffect(() => {
    setTmpCategories(categories?.value || []);
  }, [categories]);

  const onChangeStatus = (food: FoodModel) => {
    const oldTmpCategories = tmpCategories;
    if (food.isSoldOut || food.status == 2) {
      Alert.alert(`Xác nhận`, `Bạn có chắc chắn muốn mở bán ${food.name}?`, [
        {
          text: "Đồng ý",
          onPress: async () => {
            setStatusingIdList([...statusingIdList, food.id]);
            try {
              setTmpCategories(
                tmpCategories.map((category) => {
                  if (!category.foods) return category;

                  const updatedFoods = category.foods.map((f) =>
                    f.id === food.id ? { ...f, status: 1, isSoldOut: false } : f
                  );

                  // Trả về category mới với foods đã cập nhật
                  return { ...category, foods: updatedFoods };
                })
              );
              const response = await apiClient.put(
                "shop-owner/food/" + food.id + "/status",
                {
                  status: 1,
                  isSoldOut: false,
                }
              );

              toast.show(`Đã bật mở bán ${food.name}!`, {
                type: "info",
                duration: 2000,
              });

              // router.replace("/menu/option-group/link");
            } catch (error: any) {
              setTmpCategories(oldTmpCategories);
              if (error.response && error.response.status === 500) {
                Alert.alert("Xảy ra lỗi", "Vui lòng thử lại sau!");
              } else
                Alert.alert(
                  "Xảy ra lỗi",
                  error?.response?.data?.error?.message || "Vui lòng thử lại!"
                );
            } finally {
              setStatusingIdList(statusingIdList.filter((id) => id != food.id));
            }
          },
        },
        {
          text: "Hủy",
        },
      ]);
    } else {
      Alert.alert(
        `Xác nhận`,
        `Bạn có chắc tạm ẩn hay tạm hết hàng cho ${food.name}?`,
        [
          {
            text: "Tạm hết hàng",
            onPress: async () => {
              setStatusingIdList([...statusingIdList, food.id]);
              try {
                setTmpCategories(
                  tmpCategories.map((category) => {
                    if (!category.foods) return category;

                    const updatedFoods = category.foods.map((f) =>
                      f.id === food.id
                        ? { ...f, status: 1, isSoldOut: true }
                        : f
                    );

                    // Trả về category mới với foods đã cập nhật
                    return { ...category, foods: updatedFoods };
                  })
                );
                const response = await apiClient.put(
                  "shop-owner/food/" + food.id + "/status",
                  {
                    status: 1,
                    isSoldOut: true,
                  }
                );
                toast.show(
                  `Tạm hết hàng cho ${food.name}, món sẽ tự động mở bán trở lại vào ngày mai!`,
                  {
                    type: "info",
                    duration: 3000,
                  }
                );

                // router.replace("/menu/option-group/link");
              } catch (error: any) {
                setTmpCategories(oldTmpCategories);
                if (error.response && error.response.status === 500) {
                  Alert.alert("Xảy ra lỗi", "Vui lòng thử lại sau!");
                } else
                  Alert.alert(
                    "Xảy ra lỗi",
                    error?.response?.data?.error?.message || "Vui lòng thử lại!"
                  );
              } finally {
                setStatusingIdList(
                  statusingIdList.filter((id) => id != food.id)
                );
              }
            },
          },
          {
            text: "Tạm ẩn món",
            onPress: async () => {
              setStatusingIdList([...statusingIdList, food.id]);
              try {
                setTmpCategories(
                  tmpCategories.map((category) => {
                    if (!category.foods) return category;

                    const updatedFoods = category.foods.map((f) =>
                      f.id === food.id
                        ? { ...f, status: 2, isSoldOut: false }
                        : f
                    );

                    // Trả về category mới với foods đã cập nhật
                    return { ...category, foods: updatedFoods };
                  })
                );
                const response = await apiClient.put(
                  "shop-owner/food/" + food.id + "/status",
                  {
                    status: 2,
                    isSoldOut: false,
                  }
                );
                toast.show(
                  `Tạm ẩn món ${food.name}, món sẽ được ẩn đến khi bạn mở bán trở lại!`,
                  {
                    type: "info",
                    duration: 2000,
                  }
                );

                // router.replace("/menu/option-group/link");
              } catch (error: any) {
                setTmpCategories(oldTmpCategories);
                if (error.response && error.response.status === 500) {
                  Alert.alert("Xảy ra lỗi", "Vui lòng thử lại sau!");
                } else
                  Alert.alert(
                    "Xảy ra lỗi",
                    error?.response?.data?.error?.message || "Vui lòng thử lại!"
                  );
              } finally {
                setStatusingIdList(
                  statusingIdList.filter((id) => id != food.id)
                );
              }
            },
          },
          {
            text: "Hủy",
          },
        ]
      );
    }
  };

  useEffect(() => {
    console.log(tmpCategories);
    if (tmpCategories) {
      const oldExtendCategories = extendCategories;
      setExtendCategories(
        tmpCategories?.map((category) => ({
          ...category,
          isCollapsible:
            oldExtendCategories.find((cat) => cat.id == category.id)
              ?.isCollapsible ?? true,
        })) as ExtendCategoryModel[]
      );
    }
  }, [tmpCategories]);

  useFocusEffect(
    React.useCallback(() => {
      if (!isFetching) {
        refetch();
      }
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
          onLongPress={drag}
        >
          <View>
            <View className="flex-row items-center gap-x-2 justify-start">
              <Text className="font-bold text-lg text-gray-800">
                {item.name}
              </Text>
              <Text className="text-gray-700 text-sm">
                {item.foods?.length} món
              </Text>
            </View>
            <CustomButton
              title="Chỉnh sửa danh mục"
              handlePress={async () => {
                setNotFoundInfo(
                  notFoundInfo.message,
                  "/menu",
                  notFoundInfo.linkDesc
                );
                try {
                  const response = await apiClient.get<
                    ValueResponse<ShopCategoryModel>
                  >(`shop-owner/category/${item.id}`);
                  setShopCategoryModel({ ...response.data.value });
                  beforeGo();
                  router.push("/menu/category/update");
                  // console.log("Food Detail model: ", foodDetailModel);
                } catch (error: any) {
                  if (error.response && error.response.status === 404) {
                    Alert.alert("Oops!", "Danh mục này không tồn tại!");
                    refetch();
                  } else {
                    Alert.alert(
                      "Oops!",
                      error?.response?.data?.error?.message ||
                        "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                    );
                  }
                }
              }}
              containerStyleClasses="bg-white border-gray-200 border-2 h-[26px] px-[8px] self-start"
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
                key={food.id + (Math.random() % 1_00_000_000)}
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
                        className="text-md font-semibold mt-[-2px] text-gray-600"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {food.name}
                      </Text>
                      <Text className="text-[12.8px] italic text-gray-500 mt-[-2px]">
                        {food.price.toLocaleString()}đ
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Switch
                      className={`scale-75 mt-1 mr-[-6px] ${
                        statusingIdList.some((id) => item.id == id)
                          ? "opacity-50"
                          : ""
                      } ${Platform.OS == "android" ? "mt-[-7px]" : ""}`}
                      disabled={statusingIdList.some((id) => item.id == id)}
                      color="#e95137"
                      value={!food.isSoldOut && food.status == 1}
                      onValueChange={() => onChangeStatus(food)}
                    />
                    <Text
                      className={`ml-2 text-gray-500 italic text-[6px] text-secondary-200 text-gray-500 ${
                        Platform.OS == "android" ? "mt-[-9px] text-[7px]" : ""
                      }`}
                    >
                      {food.isSoldOut
                        ? "Tạm hết hàng"
                        : food.status == 1
                        ? "Đang mở bán"
                        : "Tạm ẩn"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center gap-2 pt-2">
                  <View>
                    <Text className="text-gray-500 italic text-[12px] text-secondary-200">
                      {food.totalOrderInNextTwoHours} đơn cần xử lí trong 2h tới
                    </Text>
                    <Text className="mt-1 text-gray-500 italic text-[7px] text-secondary-200 text-gray-500">
                      {food.operatingSlots.length == 0
                        ? "Chưa mở bán khung giờ nào"
                        : `Mở bán: ${food.operatingSlots
                            .sort((a, b) => a.startTime - b.startTime)
                            .map(
                              (item) =>
                                `${utilService.formatTime(
                                  item.startTime
                                )} - ${utilService.formatTime(item.endTime)}`
                            )
                            .join(" | ")}`}
                    </Text>
                  </View>

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
                        beforeGo();
                        router.push("/menu/food/update");
                        // console.log("Food Detail model: ", foodDetailModel);
                      } catch (error: any) {
                        if (error.response && error.response.status === 404) {
                          Alert.alert("Oops!", "Món này không tồn tại!");
                          refetch();
                        } else {
                          Alert.alert(
                            "Oops!",
                            error?.response?.data?.error?.message ||
                              "Hệ thống đang bảo trì, vui lòng thử lại sau!"
                          );
                        }
                      }
                    }}
                    className="bg-[#227B94] border-[#227B94] border-[1.2px] rounded-md items-center justify-center px-[6px] py-[2px] bg-whitee"
                  >
                    {/* text-[#227B94] font-semibold */}
                    <Text className="text-[12px] text-white ">Chỉnh sửa</Text>
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
          containerStyleClasses="w-[98%] h-[50px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-semibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[15px] text-gray-900 ml-1 text-white"
        />
      </View>

      <View className="w-full gap-2 p-4 pt-3">
        <View className="w-full">
          {/* <Searchbar
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
          /> */}
        </View>
        <ScrollView style={{ width: "100%", flexShrink: 0 }} horizontal={true}>
          <View className="w-full flex-row gap-2 items-center justify-between pb-2 ">
            <TouchableOpacity
              onPress={() => setQuery({ ...query, filterMode: 0 })}
            >
              <Text
                className={`bg-gray-100 rounded-xl px-4 py-2 ${
                  query.filterMode == 0 && "bg-secondary"
                }`}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setQuery({ ...query, filterMode: 1 })}
            >
              <Text
                className={`bg-gray-100 rounded-xl px-4 py-2 ${
                  query.filterMode == 1 && "bg-secondary"
                }`}
              >
                Trong khung giờ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setQuery({ ...query, filterMode: 2 })}
            >
              <Text
                className={`bg-gray-100 rounded-xl px-4 py-2 ${
                  query.filterMode == 2 && "bg-secondary"
                }`}
              >
                Ngoài khung giờ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setQuery({ ...query, filterMode: 3 })}
            >
              <Text
                className={`bg-gray-100 rounded-xl px-4 py-2 ${
                  query.filterMode == 3 && "bg-secondary"
                }`}
              >
                Đang mở bán
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setQuery({ ...query, filterMode: 4 })}
            >
              <Text
                className={`bg-gray-100 rounded-xl px-4 py-2 ${
                  query.filterMode == 4 && "bg-secondary"
                }`}
              >
                Tạm hết hàng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setQuery({ ...query, filterMode: 5 })}
            >
              <Text
                className={`bg-gray-100 rounded-xl px-4 py-2 ${
                  query.filterMode == 5 && "bg-secondary"
                }`}
              >
                Đã ẩn
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View className="gap-y-2 pb-[272px]">
          {/* {isLoading && (
            <ActivityIndicator animating={isLoading} color="#FCF450" />
          )} */}
          {!isFetching && !categories?.value.length && (
            <Text className="text-gray-600 text-center mt-[-12px]">
              Không tìm thấy danh mục và sản phẩm tương ứng
            </Text>
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
              beforeGo();
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
              beforeGo();
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
