import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import AvatarChange from "@/components/common/AvatarChange";
import ShopProfileChange from "@/components/shop/ShopProfileChange";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import AccountProfileChange from "@/components/shop/AccountProfileChange";
import AccountAvatarChange from "@/components/common/AccountAvatarChange";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { ShopProfileGetModel } from "@/types/models/ShopProfileModel";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { useFocusEffect } from "expo-router";

const Account = () => {
  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_PROFILE_FULL_INFO,
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    [],
  );
  useFocusEffect(
    React.useCallback(() => {
      shopProfile.refetch();
    }, []),
  );
  return (
    <PageLayoutWrapper>
      <AccountAvatarChange />
      <AccountProfileChange />
    </PageLayoutWrapper>
  );
};

export default Account;
