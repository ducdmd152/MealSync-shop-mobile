import { View, Text, Touchable, TouchableOpacity } from "react-native";
import React, { ReactNode } from "react";
import sessionService from "@/services/session-service";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StaffAccountAvatarChange from "@/components/common/StaffAccountAvatarChange";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import { endpoints } from "@/services/api-services/api-service-instances";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import apiClient from "@/services/api-services/api-client";
import useGlobalSocketState from "@/hooks/states/useGlobalSocketState";

import {
  ShopDeliveryStaffModel,
  ShopDeliveryStaffStatus,
} from "@/types/models/StaffInfoModel";
import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
interface LinkItem {
  text: string;
  icon: ReactNode;
  handlePress: () => void;

  textStyleClasses: string;
}
interface LinkGroupProps {
  title: string;
  containerStyleClasses: string;
  data: LinkItem[];
}

const LinkGroup: React.FC<LinkGroupProps> = ({
  title,
  containerStyleClasses = "",
  data,
}) => {
  return (
    <View className={containerStyleClasses}>
      {/* <Text className="font-semibold text-gray-600">{title}</Text> */}
      <View className="text-gray-700">
        {data.map((item, index) => (
          <TouchableOpacity
            key={item.text}
            onPress={() => item.handlePress()}
            className="flex-row p-1 justify-between items-center mt-1"
          >
            <View className="flex-row gap-x-2">
              {item.icon}
              <Text
                className={`font-semibold text-[16px] text-gray-700 ${item.textStyleClasses}`}
              >
                {item.text}
              </Text>
            </View>
            <Ionicons size={22} name="chevron-forward-outline" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
const Account = () => {
  const globalSocketState = useGlobalSocketState();
  const globalAuthState = useGlobalAuthState();

  const staffAccount = useFetchWithRQWithFetchFunc(
    [endpoints.STAFF_INFO],
    async (): Promise<FetchValueResponse<ShopDeliveryStaffModel>> =>
      apiClient.get(endpoints.STAFF_INFO).then((response) => response.data),
    [],
  );
  useFocusEffect(
    React.useCallback(() => {
      if (staffAccount.isFetched) staffAccount.refetch();
    }, []),
  );
  const navigation = useNavigation();
  const redirections = {
    account: [
      {
        text: "Hồ sơ của tôi",
        icon: <Ionicons size={22} name="person-circle-outline" />,
        handlePress: () => router.push("/account/staff-profile"),
        textStyleClasses: "text-gray-800",
      },
      {
        text: "Cập nhật mật khẩu",
        icon: <Ionicons size={20} name="key-outline" />,
        handlePress: () => router.push("/account/password-update"),
        textStyleClasses: "text-gray-800",
      },
      {
        text: "Đăng xuất",
        icon: <Ionicons size={22} name="log-out-outline" />,
        handlePress: () => {
          sessionService.clear();
          globalAuthState.clear();
          if (globalSocketState.socket != null) {
            globalSocketState.socket.disconnect();
            globalSocketState.setSocket(null);
          }
          navigation.reset({
            index: 0,
            routes: [{ name: "index" }],
          });
        },
        textStyleClasses: "text-gray-600",
      },
    ] as LinkItem[],
  };

  const getStaffStatus = () => {
    // console.log(
    //   "staffAccount.data?.value.shopDeliveryStaffStatus: ",
    //   staffAccount.data?.value,
    //   staffAccount.data?.value.shopDeliveryStaffStatus
    // );
    if (
      staffAccount.data?.value.shopDeliveryStaffStatus ==
      ShopDeliveryStaffStatus.On
    )
      return (
        <Text className="text-center  text-[#22c55e] font-medium  mt-2">
          Đang hoạt động
        </Text>
      );
    if (
      staffAccount.data?.value.shopDeliveryStaffStatus ==
      ShopDeliveryStaffStatus.Off
    )
      return (
        <Text className="text-center text-[#a1a1aa] font-medium  mt-2">
          Đang nghỉ phép
        </Text>
      );
    if (
      staffAccount.data?.value.shopDeliveryStaffStatus ==
      ShopDeliveryStaffStatus.Off
    )
      return (
        <Text className="text-center text-[#f87171] font-medium  mt-2">
          Đã bị khóa
        </Text>
      );
    return null;
  };
  return (
    <View className="p-4 bg-white flex-1">
      <StaffAccountAvatarChange />
      <View className="mt-[-12px] mb-4">{getStaffStatus()}</View>
      <LinkGroup
        title="TÀI KHOẢN"
        data={redirections.account}
        containerStyleClasses="mt-3"
      />
    </View>
  );
};

export default Account;
