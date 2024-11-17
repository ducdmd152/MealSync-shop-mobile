import StaffAccountAvatarChange from "@/components/common/StaffAccountAvatarChange";
import StaffProfileChange from "@/components/shop/StaffProfileChange";
import { ShopDeliveryStaffModel } from "@/types/models/StaffInfoModel";
import React, { useRef } from "react";
import { SafeAreaView, ScrollView } from "react-native";
export const emptyShopDeliveryStaff: ShopDeliveryStaffModel = {
  id: 0,
  phoneNumber: "",
  email: "",
  avatarUrl: "",
  fullName: "",
  genders: 0,
  accountStatus: 0,
  shopDeliveryStaffStatus: 1,
  createdDate: "",
  updatedDate: "",
};

const Profile = () => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  //   const staffAccount = useFetchWithRQWithFetchFunc(
  //     [endpoints.STAFF_INFO],
  //     async (): Promise<FetchValueResponse<ShopDeliveryStaffModel>> =>
  //       apiClient.get(endpoints.STAFF_INFO).then((response) => response.data),
  //     []
  //   );
  //   useFocusEffect(
  //     React.useCallback(() => {
  //       if (staffAccount.isFetched) staffAccount.refetch();
  //     }, [])
  //   );
  //   const getStaffStatus = () => {
  //     // console.log(
  //     //   "staffAccount.data?.value.shopDeliveryStaffStatus: ",
  //     //   staffAccount.data?.value,
  //     //   staffAccount.data?.value.shopDeliveryStaffStatus
  //     // );
  //     if (
  //       staffAccount.data?.value.shopDeliveryStaffStatus ==
  //       ShopDeliveryStaffStatus.On
  //     )
  //       return (
  //         <Text className="text-center text-[14px]  text-[#22c55e] font-medium  mt-2">
  //           Đang hoạt động
  //         </Text>
  //       );
  //     if (
  //       staffAccount.data?.value.shopDeliveryStaffStatus ==
  //       ShopDeliveryStaffStatus.Off
  //     )
  //       return (
  //         <Text className="text-center text-[14px] text-[#a1a1aa] font-medium  mt-2">
  //           Đang nghỉ phép
  //         </Text>
  //       );
  //     if (
  //       staffAccount.data?.value.shopDeliveryStaffStatus ==
  //       ShopDeliveryStaffStatus.Off
  //     )
  //       return (
  //         <Text className="text-center text-[14px] text-[#f87171] font-medium  mt-2">
  //           Đã bị khóa
  //         </Text>
  //       );
  //     return null;
  //   };
  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <ScrollView ref={scrollViewRef}>
        <StaffAccountAvatarChange />
        {/* <View className="mt-[-12px] mb-4">{getStaffStatus()}</View> */}
        <StaffProfileChange scrollViewRef={scrollViewRef} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
