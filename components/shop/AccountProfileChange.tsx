import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import FormFieldCustom from "../custom/FormFieldCustom";
import CustomCheckbox from "../custom/CustomCheckbox";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../custom/CustomButton";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { ShopProfileGetModel } from "@/types/models/ShopProfileModel";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import utilService from "@/services/util-service";
import sessionService from "@/services/session-service";
import { router, useFocusEffect } from "expo-router";

const ShopProfileChange = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_PROFILE_FULL_INFO,
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    []
  );
  const [email, setEmail] = useState("--------------");
  useFocusEffect(
    React.useCallback(() => {
      setEmail(shopProfile.data?.value.email || "");
    }, [shopProfile.data?.value])
  );
  return (
    <View className="w-full px-4 py-2 ">
      <FormFieldCustom
        title={"Email"}
        value={email}
        placeholder={"Nhập địa chỉ email..."}
        handleChangeText={(e) => {}}
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-14 border-gray-100"
        readOnly={true}
      />

      <CustomButton
        title="Cập nhật email"
        handlePress={() => {
          router.push("/account/email-update");
        }}
        iconRight={
          <Ionicons name="arrow-forward-outline" size={22} color="white" />
        }
        containerStyleClasses="bg-primary-100 w-full mt-3 h-12 mt-3"
        textStyleClasses="text-white mr-2"
        isLoading={isSubmitting}
      />
      <CustomButton
        title="Thay đổi mật khẩu"
        handlePress={() => {
          router.push("/account/password-update");
        }}
        // iconLeft={<Ionicons name="arrow-back-outline" size={22} color="gray" />}
        containerStyleClasses="w-full mt-2 bg-white border-gray-500 border-2 h-12"
        textStyleClasses="ml-2 text-gray-600"
        isLoading={isSubmitting}
      />
    </View>
  );
};

export default ShopProfileChange;
