import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import { endpoints } from "@/services/api-services/api-service-instances";
import FetchResponse from "@/types/responses/FetchResponse";
import { FoodPackingUnit } from "@/types/models/FoodPackagingUnitModel";
import apiClient from "@/services/api-services/api-client";
import { ActivityIndicator } from "react-native-paper";
import CustomButton from "../custom/CustomButton";

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
  useEffect(() => {
    const tmp = foodPackingUnitFetcher?.data?.value.items || [];
    setUnits(tmp.filter((item) => item.type == 2));
  }, [foodPackingUnitFetcher?.data?.value.items]);
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
              <Text className="w-full text-center text-[#14b8a6] font-semibold">
                {unit.name + " ~ " + unit.weight + "kg"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <CustomButton
        title="Thêm mới"
        containerStyleClasses="mt-3 bg-secondary h-10"
        textStyleClasses="text-white text-[14px]"
        handlePress={() => {}}
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
