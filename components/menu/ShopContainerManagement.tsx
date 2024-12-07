import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import { endpoints } from "@/services/api-services/api-service-instances";
import FetchResponse from "@/types/responses/FetchResponse";
import { FoodPackingUnit } from "@/types/models/FoodPackagingUnitModel";
import apiClient from "@/services/api-services/api-client";
import { ActivityIndicator } from "react-native-paper";
import CustomButton from "../custom/CustomButton";
import CustomModal from "../common/CustomModal";
import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const ShopContainerManagement = ({ exit }: { exit: () => void }) => {
  const foodPackingUnitFetcher = useFetchWithRQWithFetchFunc(
    [endpoints.FOOD_PACKING_UNIT_LIST],
    (): Promise<FetchResponse<FoodPackingUnit>> =>
      apiClient
        .get(endpoints.FOOD_PACKING_UNIT_LIST, {
          params: {
            pageIndex: 1,
            pageSize: 100_000_000,
          },
        })
        .then((response) => response.data),
    []
  );
  const [units, setUnits] = useState<FoodPackingUnit[]>([]);
  const globalAuthState = useGlobalAuthState();

  const [unitModel, setUnitModel] = useState<FoodPackingUnit>({
    id: 0,
    shopId: globalAuthState.authDTO?.id || 0,
    name: "",
    weight: 0.1,
    type: 2,
  });
  const [isCreateOrEdit, setIsCreateOrEdit] = useState(false);
  useEffect(() => {
    const tmp = foodPackingUnitFetcher?.data?.value.items || [];
    setUnits(tmp.filter((item) => item.type == 2));
  }, [foodPackingUnitFetcher?.data?.value.items]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <View>
      <Text className="text-center text-[14px] font-semibold">
        Danh sách vật đựng và khối lượng quy đổi
      </Text>
      <ActivityIndicator
        animating={foodPackingUnitFetcher.isFetching}
        color="#FCF450"
      />
      {foodPackingUnitFetcher.isFetched && units.length == 0 && (
        <View className="h-20 w-full items-center justify-center">
          <Text className="text-[13.2px] text-center italic gray-700">
            Bạn chưa tạo vật đựng nào
          </Text>
        </View>
      )}

      <View>
        {units.map((unit) => (
          <View key={unit.id}>
            <TouchableOpacity className="border-[1px] border-gray-200 flex-row justify-between items-center p-2 mb-2 rounded-lg">
              <Text className="flex-1 text-center text-[#14b8a6] font-semibold">
                {unit.name + " ~ " + unit.weight + "kg"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setUnitModel(unit);
                  setIsCreateOrEdit(true);
                }}
              >
                <Ionicons name="create-outline" size={24} color="#227B94" />
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-1"
                onPress={() => {
                  Alert.alert(`Xác nhận`, `Bạn muốn xóa vật đựng này?`, [
                    {
                      text: "Xác nhận xóa",
                      onPress: async () => {
                        apiClient
                          .delete(`shop-onwer/food-packing-unit/${unit.id}`)
                          .then((response) => {
                            // console.log(response.data);
                            foodPackingUnitFetcher.refetch();
                            Toast.show({
                              type: "success",
                              text1: "Hoàn tất",
                              text2: `Đã xóa "${
                                unit.name + " ~ " + unit.weight + "kg"
                              }".`,
                              // time: 15000
                            });
                          })
                          .catch((error: any) => {
                            if (
                              error.response &&
                              (error.response.status == 500 ||
                                error.response.status == 501 ||
                                error.response.status == 502)
                            ) {
                              Alert.alert(
                                "Oops!",
                                error?.response?.data?.error?.message ||
                                  "Xử lí bị gián đoạn, vui lòng thử lại!"
                              );
                            } else
                              Alert.alert(
                                "Oops!",
                                error?.response?.data?.error?.message ||
                                  "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                              );
                          })
                          .finally(() => {
                            // setIsSubmitting(false);
                          });
                      },
                    },
                    {
                      text: "Hủy",
                    },
                  ]);
                }}
              >
                <Ionicons name="trash-outline" size={22} color="#FF9001" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <CustomModal
        title={unitModel.id == 0 ? "Tạo vật đựng mới" : "Chỉnh sửa vật đựng"}
        isOpen={isCreateOrEdit}
        setIsOpen={setIsCreateOrEdit}
      >
        <View>
          <View className="mb-2">
            <Text className="font-bold text-[12.8px]">Tên gọi</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 mt-1 px-3 p-2 rounded text-[15px]"
                value={unitModel.name}
                onChangeText={(text) => {
                  setUnitModel({ ...unitModel, name: text });
                }}
                placeholder="Nhập tên vật đựng"
                placeholderTextColor="#888"
              />
            </View>
          </View>
          <View className="mb-2">
            <Text className="font-bold text-[12.8px]">Cân nặng (gam)</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 mt-1 px-3 p-2 rounded text-[15px]"
                value={Math.trunc(unitModel.weight * 1000).toString()}
                onChangeText={(text) => {
                  setUnitModel({
                    ...unitModel,
                    weight: (isNaN(parseInt(text)) ? 0 : parseInt(text)) / 1000,
                  });
                }}
                placeholder="Nhập cân nặng"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
              <Text className="text-[12px] text-gray-600 italic mt-1 ml-1">
                Khối lượng này là khối lượng bao gồm sản phẩm và vật đựng tương
                ứng (trường hợp vật đựng có khối lượng đáng kể).
              </Text>
            </View>
          </View>
          <CustomButton
            title={unitModel.id == 0 ? "Thêm mới" : "Cập nhật"}
            isLoading={isSubmitting}
            containerStyleClasses="mt-3 bg-secondary h-10"
            textStyleClasses="text-white text-[14px]"
            handlePress={() => {
              if (unitModel.name.trim().length == 0) {
                Alert.alert("Oops", "Vui lòng nhập tên vật đựng!");
                return;
              }
              if (unitModel.weight <= 0) {
                Alert.alert("Oops", "Vui lòng cân nặng lớn hơn 0!");
                return;
              }
              setIsSubmitting(true);
              if (unitModel.id == 0)
                apiClient
                  .post(`shop-onwer/food-packing-unit`, unitModel)
                  .then((response) => {
                    // console.log(response.data);
                    foodPackingUnitFetcher.refetch();
                    setIsCreateOrEdit(false);
                    Toast.show({
                      type: "success",
                      text1: "Hoàn tất",
                      text2: `Tạo mới thành công.`,
                      // time: 15000
                    });
                  })
                  .catch((error: any) => {
                    if (
                      error.response &&
                      (error.response.status == 500 ||
                        error.response.status == 501 ||
                        error.response.status == 502)
                    ) {
                      Alert.alert(
                        "Oops!",
                        error?.response?.data?.error?.message ||
                          "Xử lí bị gián đoạn, vui lòng thử lại!"
                      );
                    } else
                      Alert.alert(
                        "Oops!",
                        error?.response?.data?.error?.message ||
                          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                      );
                  })
                  .finally(() => {
                    setIsSubmitting(false);
                  });
              else
                apiClient
                  .put(
                    `shop-onwer/food-packing-unit/${unitModel.id}`,
                    unitModel
                  )
                  .then((response) => {
                    foodPackingUnitFetcher.refetch();
                    setIsCreateOrEdit(false);
                    // console.log(response.data);
                    Toast.show({
                      type: "success",
                      text1: "Hoàn tất",
                      text2: `Cập nhật thành công.`,
                      // time: 15000
                    });
                  })
                  .catch((error: any) => {
                    if (
                      error.response &&
                      (error.response.status == 500 ||
                        error.response.status == 501 ||
                        error.response.status == 502)
                    ) {
                      Alert.alert(
                        "Oops!",
                        error?.response?.data?.error?.message ||
                          "Xử lí bị gián đoạn, vui lòng thử lại!"
                      );
                    } else
                      Alert.alert(
                        "Oops!",
                        error?.response?.data?.error?.message ||
                          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                      );
                  })
                  .finally(() => {
                    setIsSubmitting(false);
                  });
            }}
          />
        </View>
      </CustomModal>
      <CustomButton
        title="Thêm mới"
        containerStyleClasses="mt-3 bg-secondary h-10"
        textStyleClasses="text-white text-[14px]"
        handlePress={() => {
          setUnitModel({
            id: 0,
            shopId: globalAuthState.authDTO?.id || 0,
            name: "",
            weight: 0,
            type: 2,
          });
          setIsCreateOrEdit(true);
        }}
      />
      <CustomButton
        title="Thoát"
        containerStyleClasses="mt-2 bg-white border-gray-300 border-[2px] h-10"
        textStyleClasses="text-white text-[14px] text-gray-500 font-normal"
        handlePress={() => {
          exit();
        }}
      />
    </View>
  );
};

export default ShopContainerManagement;
