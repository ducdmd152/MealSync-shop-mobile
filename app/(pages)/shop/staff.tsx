import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import utilService from "@/services/util-service";
import { RefreshControl, TextInput } from "react-native-gesture-handler";
import CONSTANTS from "@/constants/data";
import { endpoints } from "@/services/api-services/api-service-instances";
import apiClient from "@/services/api-services/api-client";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import {
  BalanceModel,
  sampleWalletTransactionList,
  WalletTransaction,
} from "@/types/models/BalanceModel";
import ValueResponse from "@/types/responses/ValueReponse";
import { useFocusEffect } from "expo-router";
import FetchResponse from "@/types/responses/FetchResponse";
import sessionService from "@/services/session-service";
import dayjs from "dayjs";
import {
  ShopDeliveryStaffModel,
  ShopDeliveryStaffStatus,
} from "@/types/models/StaffInfoModel";
import { Switch } from "react-native-paper";
import { useToast } from "react-native-toast-notifications";

const StaffManagement = () => {
  const toast = useToast();
  const staffsFetch = useFetchWithRQWithFetchFunc(
    [endpoints.STAFF_LIST].concat(["shop-staff-page"]),
    async (): Promise<FetchResponse<ShopDeliveryStaffModel>> =>
      apiClient
        .get(endpoints.STAFF_LIST, {
          headers: {
            Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            // startDate: fromDate.toISOString(),
            // endDate: toDate.add(1, "day").toISOString(),
            pageIndex: 1,
            pageSize: 100_000_000,
          },
        })
        .then((response) => response.data),
    []
  );
  //   console.log(staffsFetch.data?.value.items);
  useFocusEffect(
    React.useCallback(() => {
      staffsFetch.refetch();
    }, [])
  );

  const onChangeStaffStatusSubmit = (
    staff: ShopDeliveryStaffModel,
    onSuccess: () => void
  ) => {};
  const getStaffStatusComponent = (staff: ShopDeliveryStaffModel) => {
    let label = "";
    let bgColor = "";
    let isSwitchOn = true;
    let onSwitchTouch = () => {};
    switch (staff.shopDeliveryStaffStatus) {
      case ShopDeliveryStaffStatus.On:
        label = "Hoạt động";
        bgColor = "#7dd3fc";
        isSwitchOn = true;
        break;
      case ShopDeliveryStaffStatus.Off:
        label = "Nghỉ phép";
        bgColor = "#fde047";
        isSwitchOn = false;

        break;
      case ShopDeliveryStaffStatus.Inactive:
        label = "Đã khóa";
        bgColor = "#cbd5e1";
        isSwitchOn = false;
        break;
    }
    if (staff.shopDeliveryStaffStatus == 1) {
      onSwitchTouch = () => {
        Alert.alert(
          `Xác nhận`,
          `Bạn muốn chuyển trạng thái của ${staff.fullName} sang nghỉ phép hay khóa tài khoản?`,
          [
            {
              text: "Chuyển sang nghỉ phép",
              onPress: async () => {
                onChangeStaffStatusSubmit(
                  { ...staff, shopDeliveryStaffStatus: 2 },
                  () => {
                    staffsFetch.refetch();
                    toast.show(
                      `Đã chuyển ${staff.fullName} sang trạng thái nghỉ phép`,
                      {
                        type: "success",
                        duration: 2000,
                      }
                    );
                  }
                );
              },
            },
            {
              text: "Khóa tài khoản",
              onPress: async () => {
                onChangeStaffStatusSubmit(
                  { ...staff, shopDeliveryStaffStatus: 3 },
                  () => {
                    staffsFetch.refetch();
                    toast.show(
                      `Đã chuyển khóa tài khoản của ${staff.fullName} `,
                      {
                        type: "info",
                        duration: 2000,
                      }
                    );
                  }
                );
              },
            },
            {
              text: "Hủy",
            },
          ]
        );
      };
    } else {
      onSwitchTouch = () => {
        Alert.alert(
          `Xác nhận`,
          staff.shopDeliveryStaffStatus == 2
            ? `Chuyển trạng thái của ${staff.fullName} sang trạng thái hoạt động?`
            : `Xác nhận mở khóa tài khoản ${staff.fullName}?`,
          [
            {
              text: "Xác nhận",
              onPress: async () => {
                onChangeStaffStatusSubmit(
                  { ...staff, shopDeliveryStaffStatus: 1 },
                  () => {
                    staffsFetch.refetch();
                    toast.show(`Xác nhận`, {
                      type: "info",
                      duration: 2000,
                    });
                  }
                );
              },
            },
            {
              text: "Hủy",
            },
          ]
        );
      };
    }
    return (
      <View
        className="flex-row items-center rounded-lg "
        style={{ backgroundColor: "#fefce8" }}
      >
        <View className="scale-50 h-6 items-center justify-center ml-[-4px]">
          <Switch
            color="#22c55e"
            value={staff.shopDeliveryStaffStatus == 1}
            onValueChange={(value) => {
              onSwitchTouch();
            }}
          />
        </View>
        <Text className="text-[11px] italic text-gray-500 mr-2 ml-[-4px]">
          {label}
        </Text>
      </View>
    );
  };
  return (
    <View className="p-4 h-full px-2 w-full bg-white">
      <ScrollView
        style={{ width: "100%", flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            tintColor={"#FCF450"}
            onRefresh={() => {
              staffsFetch.refetch();
            }}
            refreshing={staffsFetch.isFetching}
          />
        }
      >
        {!staffsFetch.isFetching && !staffsFetch.data?.value.items?.length && (
          <Text className="text-gray-600 text-center mt-6">
            {staffsFetch.data?.value.items?.length == 0
              ? "Không có nhân viên nào"
              : "Mất kết nối, vui lòng thử lại"}
          </Text>
        )}

        {(staffsFetch.data?.value.items?.length || 0) > 0 && (
          <Text className="text-gray-600 text-center mt-6">
            {staffsFetch.data?.value.items?.length} nhân viên trong cửa hàng
          </Text>
        )}
        <View className="flex-1 p-2 mt-2 pb-[72px]">
          {staffsFetch.data?.value.items.map((staff, index) => (
            <TouchableOpacity
              onPress={() => {}}
              key={staff.id}
              className={`p-4 pt-3 bg-white drop-shadow-md rounded-lg shadow mb-3`}
            >
              <View className="flex-row flex-1 items-start ">
                <View className="border-[1px] border-gray-200 mr-2 ml-[-2px] rounded-full p-[1px] overflow-hidden mb-1">
                  <Image
                    source={{
                      uri: staff.avatarUrl,
                    }}
                    resizeMode="cover"
                    className="h-[40px] w-[40px] opacity-85"
                  />
                </View>

                <View>
                  <View className="flex-row w-full justify-between items-center">
                    <Text className="text-[12.5px] font-psemibold">
                      {staff.fullName}
                    </Text>
                    <View className="mr-10">
                      {getStaffStatusComponent(staff)}
                    </View>
                  </View>

                  <Text className="text-[11px] italic text-gray-500 mt-[4px]">
                    Đã thêm vào{" "}
                    {dayjs(staff.createdDate)
                      .local()
                      .format("HH:mm DD/MM/YYYY")}{" "}
                  </Text>
                </View>
              </View>
              {/* <View className="flex-row justify-end gap-2 pt-2">
                <TouchableOpacity
                  onPress={() => {
                    //   globalWithdrawalState.setWithdrawal(draw);
                    // router.push("/promotion/update");
                  }}
                  className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                >
                  <Text className="text-[13.2px] text-white">Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    //   globalWithdrawalState.setWithdrawal(draw);
                    //   router.push("/promotion/details");
                  }}
                  className="bg-white border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                >
                  <Text className="text-[13.2px]">Chi tiết</Text>
                </TouchableOpacity>
              </View> */}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default StaffManagement;

const styles = StyleSheet.create({
  backgroundImage: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 20,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
