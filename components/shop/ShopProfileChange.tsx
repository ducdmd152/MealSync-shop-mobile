import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import FormFieldCustom from "../custom/FormFieldCustom";
import CustomCheckbox from "../custom/CustomCheckbox";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../custom/CustomButton";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import {
  Dormitories,
  ShopProfileGetModel,
} from "@/types/models/ShopProfileModel";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { Banner, Button } from "react-native-paper";
import { unSelectLocation } from "@/hooks/states/useMapLocationState";
import { useFocusEffect } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { TextInput } from "react-native-gesture-handler";
interface ShopProfileUpdateModel {
  shopName: string;
  shopOwnerName: string;
  dormitoryIds: number[];
  logoUrl: string;
  bannerUrl: string;
  description: string;
  phoneNumber: string;
  location: {
    id: number;
    address: string;
    latitude: number;
    longitude: number;
  };
}

const emptyShopProfileUpdate: ShopProfileUpdateModel = {
  shopName: "",
  shopOwnerName: "",
  dormitoryIds: [],
  logoUrl: "",
  bannerUrl: "",
  description: "",
  phoneNumber: "",
  location: {
    id: 0,
    address: "",
    latitude: 0,
    longitude: 0,
  },
};

const ShopProfileChange = () => {
  const toast = useToast();
  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_PROFILE_FULL_INFO,
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    []
  );
  const [model, setModel] = useState<ShopProfileUpdateModel>(
    emptyShopProfileUpdate
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const getModelFromFetch = () => {
    return {
      shopName: shopProfile.data?.value.name || "",
      shopOwnerName: shopProfile.data?.value.shopOwnerName || "",
      dormitoryIds:
        shopProfile.data?.value.shopDormitories.map(
          (item) => item.dormitoryId
        ) || [],
      logoUrl: shopProfile.data?.value.logoUrl || "",
      bannerUrl: shopProfile.data?.value.bannerUrl || "",
      description: shopProfile.data?.value.description || "", // shop infor not return
      phoneNumber: shopProfile.data?.value.phoneNumber || "",
      location: shopProfile.data?.value.location || unSelectLocation,
    } as ShopProfileUpdateModel;
  };
  useEffect(() => {
    setModel(getModelFromFetch());
  }, [isEditMode]);
  useEffect(() => {
    if (!shopProfile.isFetching) setModel(getModelFromFetch());
  }, [shopProfile.isFetching]);
  useFocusEffect(
    React.useCallback(() => {
      shopProfile.refetch();
    }, [])
  );
  return (
    <View className="w-full px-4 py-2 ">
      {!isEditMode && (
        <TouchableOpacity
          className="mt-[-20px] "
          onPress={() => {
            setIsEditMode(true);
            toast.show(
              `Bạn đang trong chế độ chỉnh sửa, vui lòng thay đổi và cập nhật thông tin.`,
              {
                type: "normal",
                duration: 3000,
                normalColor: "#06b6d4",
              }
            );
          }}
        >
          <Text className="text-center text-[#818cf8] font-semibold mt-2">
            Chỉnh sửa hồ sơ
          </Text>
        </TouchableOpacity>
      )}
      <FormFieldCustom
        title={"Tên cửa hàng"}
        value={model.shopName}
        readOnly={!isEditMode}
        placeholder={"Nhập tên cửa hàng..."}
        handleChangeText={(text) => {}}
        keyboardType="default"
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
      />
      <View className="mb-2">
        <FormFieldCustom
          title={"Mô tả cửa hàng"}
          value={model.shopName}
          readOnly={!isEditMode}
          placeholder={""}
          handleChangeText={(text) => {}}
          keyboardType="default"
          otherStyleClasses="mt-3"
          otherInputStyleClasses="h-12 border-gray-100"
          labelOnly={true}
        />
        <TextInput
          className="border border-gray-300 mt-1 p-2 rounded h-16 rounded-2xl border-2 border-gray-300 p-3"
          placeholder="Nhập mô tả..."
          value={model.description}
          onChangeText={(text) => {}}
          multiline
          placeholderTextColor="#888"
        />
      </View>

      <FormFieldCustom
        title={"Địa chỉ cửa hàng"}
        value={model.location.address || ""}
        readOnly={!isEditMode}
        placeholder={"Chọn địa chỉ cửa hàng..."}
        handleChangeText={(text) => {}}
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
        iconRight={
          <TouchableOpacity className="h-[32px] w-[32px] bg-primary rounded-md justify-center items-center relative">
            <Ionicons name="location-outline" size={28} color="white" />
          </TouchableOpacity>
        }
      />
      <View className={`gap-y-0 mt-3`}>
        <Text className="text-base text-gray-500 font-medium">
          Khu vực bán hàng
        </Text>
        <View className="flex-row gap-x-8 ml-[2px]">
          <CustomCheckbox
            isChecked={model.dormitoryIds.includes(1)}
            handlePress={() => {
              Dormitories.A;
            }}
            label={<Text className="text-[16px]">Khu A</Text>}
            containerStyleClasses={"w-[100px]"}
          />
          <CustomCheckbox
            isChecked={model.dormitoryIds.includes(Dormitories.B)}
            handlePress={() => {}}
            label={<Text className="text-[16px]">Khu B</Text>}
            containerStyleClasses={"w-[100px]"}
          />
        </View>
      </View>

      <FormFieldCustom
        title={"Số điện thoại"}
        value={model.phoneNumber}
        placeholder={"Nhập số điện thoại..."}
        handleChangeText={(e) => {}}
        keyboardType="email-address"
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
        readOnly={!isEditMode}
      />

      <FormFieldCustom
        title={"Chủ cửa hàng"}
        value={model.shopOwnerName}
        placeholder={"Nhập tên chủ cửa hàng..."}
        handleChangeText={(e) => {}}
        keyboardType="default"
        otherStyleClasses="mt-2"
        otherInputStyleClasses="h-12 border-gray-100"
        readOnly={!isEditMode}
      />

      {isEditMode && (
        <CustomButton
          title="Cập nhật"
          containerStyleClasses="mt-5 bg-secondary h-12"
          textStyleClasses="text-white"
          handlePress={() => {
            setIsEditMode(false);
          }}
        />
      )}
      {isEditMode && (
        <CustomButton
          title="Hủy"
          handlePress={() => {
            setIsEditMode(false);
          }}
          containerStyleClasses="mt-2 w-full h-[44px] px-4 bg-transparent border-[1px] border-gray-400 font-semibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[17px] text-gray-900 ml-1 text-white text-gray-500"
        />
      )}
    </View>
  );
};

export default ShopProfileChange;
