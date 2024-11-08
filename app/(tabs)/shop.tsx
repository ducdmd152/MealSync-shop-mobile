import {
  Alert,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React, { ReactNode, useEffect, useState } from "react";
import AvatarImage from "react-native-paper/lib/typescript/components/Avatar/AvatarImage";
import { ActivityIndicator, Avatar, Switch } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, useFocusEffect } from "expo-router";
import sessionService from "@/services/session-service";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import {
  OperatingSlotModel,
  ShopProfileGetModel,
} from "@/types/models/ShopProfileModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import { useToast } from "react-native-toast-notifications";
import { WITHDRAW_STATUSES_FILTER } from "@/types/models/WithdrawalModel";
import useGlobalWithdrawalState from "@/hooks/states/useGlobalWithdrawalState";
import useGlobalStaffState from "@/hooks/states/useGlobalStaffState";

const Shop = () => {
  const globalWithdrawalState = useGlobalWithdrawalState();
  const globalStaffState = useGlobalStaffState();
  const redirections = {
    shop: [
      {
        text: "Hồ sơ cửa hàng",
        icon: <Ionicons size={20} name="storefront-outline" />,
        handlePress: () => router.push("/shop/profile"),
        textStyleClasses: "text-gray-800",
      },
      {
        text: "Khuyến mãi",
        icon: <Ionicons size={19.5} name="pricetags-outline" />,
        handlePress: () => router.push("/shop/promotion"),
        textStyleClasses: "text-gray-800",
      },
      {
        text: "Lượt đánh giá",
        icon: <Ionicons size={20} name="star-outline" />,
        handlePress: () => router.push("/shop/review"),
        textStyleClasses: "text-gray-800",
      },

      {
        text: "Hiệu suất bán hàng",
        icon: <Ionicons size={20} name="stats-chart-outline" />,
        handlePress: () => router.push("/shop/statistics"),
        textStyleClasses: "text-gray-800",
      },
      {
        text: "Nhân viên giao hàng",
        icon: <Ionicons size={20} name="people-outline" />,
        handlePress: () => {
          globalStaffState.setQuery({ searchText: "", status: 0 });
          router.push("/shop/staff");
        },
        textStyleClasses: "text-gray-800",
      },
      {
        text: "Cài đặt cửa hàng",
        icon: <Ionicons size={20} name="settings-outline" />,
        handlePress: () => router.push("/shop/setting"),
        textStyleClasses: "text-gray-800",
      },
    ] as LinkItem[],
    balance: [
      {
        text: "Quản lí số dư",
        icon: <Ionicons size={20} name="wallet-outline" />,
        handlePress: () => router.push("/shop/balance"),
        textStyleClasses: "text-gray-800",
      },
      {
        text: "Yêu cầu rút tiền",
        icon: <Ionicons size={20} name="documents-outline" />,
        handlePress: () => {
          globalWithdrawalState.setStatuses(WITHDRAW_STATUSES_FILTER[0].value);
          router.push("/shop/withdrawal");
        },
        textStyleClasses: "text-gray-800",
      },
    ] as LinkItem[],
    account: [
      {
        text: "Tài khoản của tôi",
        icon: <Ionicons size={20} name="person-circle-outline" />,
        handlePress: () => router.push("/shop/account"),
        textStyleClasses: "text-gray-800",
      },

      {
        text: "Đăng xuất",
        icon: <Ionicons size={20} name="log-out-outline" />,
        handlePress: () => {
          sessionService.clear();
          router.replace("/");
        },
        textStyleClasses: "text-gray-600",
      },
    ] as LinkItem[],
  };
  const toast = useToast();
  const [isSwitchOn, setIsSwitchOn] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);
  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_PROFILE_FULL_INFO.concat(["gpkg-create-page"]),
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    []
  );
  const [cache, setCache] = useState<ShopProfileGetModel>({
    status: 2,
    isAcceptingOrderNextDay: false,
    isReceivingOrderPaused: false,
    isAutoOrderConfirmation: false,
    operatingSlots: [] as OperatingSlotModel[],
  } as ShopProfileGetModel);

  useFocusEffect(
    React.useCallback(() => {
      shopProfile.refetch();
    }, [])
  );
  useEffect(() => {
    if (!shopProfile.isFetching && shopProfile.isSuccess)
      setCache({ ...(shopProfile.data?.value || cache) });
  }, [shopProfile.data?.value]);
  const getShopStatusDescription = (
    status: number,
    isReceivingOrderPaused: boolean
  ) => {
    if (status === 0) return "";
    if (status == 1) return "Chưa được phê duyệt";
    if (status == 3) return "Tạm đóng cửa hàng";
    if (isReceivingOrderPaused) return "Tạm ngưng nhận đơn";
    if (status == 2) return "Đang mở bán";
  };
  const onChangeShopStatusRequest = async (
    request: {
      status: number;
      isReceivingOrderPaused: boolean;
      isConfirm: boolean;
    },
    onSuccess: () => void
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/shop-owner/active-inactive`,
        request
      );
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        onSuccess();
      } else if (isWarning) {
        if (request.isConfirm) return;
        const warningInfo = value as WarningMessageValue;
        Alert.alert("Xác nhận", warningInfo.message, [
          {
            text: "Đồng ý",
            onPress: async () => {
              onChangeShopStatusRequest(
                { ...request, isConfirm: true },
                onSuccess
              );
            },
          },
          {
            text: "Hủy",
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const onChangeShopStatusSubmit = async (
    status: number,
    isReceivingOrderPaused: boolean,
    onSuccess: () => void
  ) => {
    onChangeShopStatusRequest(
      {
        status,
        isReceivingOrderPaused,
        isConfirm: false,
      },
      onSuccess
    );
  };
  return (
    <View className="w-full h-full bg-white text-black p-4 relative">
      <TouchableOpacity className="flex-row justify-between items-center gap-x-2 pb-4">
        <View className="flex-row justify-start items-center gap-x-2">
          {cache.bannerUrl ? (
            <Avatar.Image
              size={48}
              source={{
                uri: cache.bannerUrl,
              }}
            />
          ) : (
            <ActivityIndicator animating={true} color="#FCF450" />
          )}

          <View className="gap-y-0">
            {cache.name ? (
              <Text className="text-lg italic text-gray text-primary font-medium mb-[-4px]">
                {cache.name}
              </Text>
            ) : (
              <ActivityIndicator animating={true} color="#FCF450" />
            )}

            <Text className="text-[11px] italic text-gray text-primary font-medium ">
              {getShopStatusDescription(
                cache.status ? cache.status : 0,
                cache.isReceivingOrderPaused || false
              )}
            </Text>
          </View>
        </View>

        <View className="scale-100">
          <Switch
            color="#e95137"
            value={cache.status == 2 && cache.isReceivingOrderPaused == false}
            onValueChange={(value) => {
              if (value) {
                Alert.alert(
                  `Xác nhận`,
                  `Bạn có muốn ${
                    cache.isReceivingOrderPaused
                      ? "mở nhận đơn trở lại"
                      : "mở cửa hàng trở lại"
                  }?`,
                  [
                    {
                      text: "Đồng ý",
                      onPress: async () => {
                        onChangeShopStatusSubmit(2, false, () => {
                          shopProfile.refetch();
                          toast.show(
                            `Cửa hàng đã ${
                              cache.isReceivingOrderPaused
                                ? "mở nhận đơn trở lại."
                                : "mở hoạt động trở lại."
                            }`,
                            {
                              type: "success",
                              duration: 2000,
                            }
                          );
                        });
                      },
                    },
                    {
                      text: "Hủy",
                    },
                  ]
                );
              } else {
                Alert.alert(
                  `Xác nhận`,
                  `Bạn muốn tạm ngưng nhận đơn hay tạm dừng hoạt động của cửa hàng?`,
                  [
                    {
                      text: "Tạm ngưng nhận đơn",
                      onPress: async () => {
                        onChangeShopStatusSubmit(2, true, () => {
                          shopProfile.refetch();
                          toast.show(`Cửa hàng của bạn đã tạm ngưng nhận đơn`, {
                            type: "info",
                            duration: 2000,
                          });
                        });
                      },
                    },
                    {
                      text: "Tạm dừng hoạt động",
                      onPress: async () => {
                        onChangeShopStatusSubmit(3, false, () => {
                          shopProfile.refetch();
                          toast.show(
                            `Cửa hàng của bạn đã chuyển sang trạng thái tạm dừng hoạt động`,
                            {
                              type: "info",
                              duration: 2000,
                            }
                          );
                        });
                      },
                    },
                    {
                      text: "Hủy",
                    },
                  ]
                );
              }
            }}
            disabled={(cache.status != 2 && cache.status != 3) || isSubmitting}
          />
        </View>
      </TouchableOpacity>
      <View className="border-b-2 border-gray-300"></View>

      <View className="gap-y-[24px] mt-1 pb-[120px] px-1">
        <LinkGroup
          title="CỬA HÀNG"
          data={redirections.shop}
          containerStyleClasses="mt-3"
        />
        <LinkGroup
          title="TÀI CHÍNH"
          data={redirections.balance}
          containerStyleClasses="mt-3"
        />
        <LinkGroup
          title="TÀI KHOẢN"
          data={redirections.account}
          containerStyleClasses="mt-3"
        />
      </View>
    </View>
  );
};

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
      <Text className="font-psemibold text-gray-600">{title}</Text>
      <View className="text-gray-700">
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => item.handlePress()}
            className="flex-row p-1 justify-between items-center mt-1"
          >
            <View className="flex-row gap-x-2">
              {item.icon}
              <Text
                className={`font-psemibold text-md text-gray-700 ${item.textStyleClasses}`}
              >
                {item.text}
              </Text>
            </View>
            <Ionicons size={20} name="chevron-forward-outline" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Shop;

const styles = StyleSheet.create({});
