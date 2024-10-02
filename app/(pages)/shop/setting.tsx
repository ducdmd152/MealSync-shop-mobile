import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Switch } from "react-native-paper";

const Setting = () => {
  const [isSwitchOn, setIsSwitchOn] = React.useState(true);
  const [isOvernight, setIsOvernight] = React.useState(true);

  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);
  const onToggleIsOvernight = () => setIsOvernight(!isOvernight);

  return (
    <PageLayoutWrapper>
      <View className="p-4 gap-y-8">
        <View className="">
          <TouchableOpacity className="flex-row justify-between items-center gap-x-2 pb-4">
            <View className="flex-row justify-start items-center gap-x-2">
              <Avatar.Image
                size={48}
                source={{
                  uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV5-FEuyxb-HMUB41PwAEX_yopAjz0KgMAbg&s",
                }}
              />
              <Text className="text-lg italic text-gray text-primary font-pmedium ">
                Tiệm ăn tháng năm
              </Text>
            </View>
            <Switch
              color="#e95137"
              value={isSwitchOn}
              onValueChange={onToggleSwitch}
            />
          </TouchableOpacity>
          <View className="border-b-2 border-gray-300"></View>
        </View>

        <View className="">
          <Text className="font-psemibold text-gray-600">
            THỜI GIAN HOẠT ĐỘNG
          </Text>
          <View className="text-gray-700">
            <TouchableOpacity
              onPress={() => {}}
              className="flex-row p-1 justify-between items-center mt-1"
            >
              <View className="flex-row gap-x-2">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                <Text className={`font-psemibold text-md text-gray-600`}>
                  7:00-10:30 | 14:00 - 17:30 | 20:00 - 22:00
                </Text>
              </View>
              <Ionicons size={20} name="chevron-forward-outline" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="">
          <Text className="font-psemibold text-gray-600">ĐẶT HÀNG QUA ĐÊM</Text>
          <View className="text-gray-700">
            <TouchableOpacity
              onPress={() => {}}
              className="flex-row p-1 justify-between items-center mt-1"
            >
              <View className="flex-row gap-x-2">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                <Text className={`font-medium text-md text-gray-600`}>
                  Cho phép đặt hàng qua đêm
                </Text>
              </View>
              <View className="scale-75">
                <Switch
                  color="#e95137"
                  value={isOvernight}
                  onValueChange={onToggleIsOvernight}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="">
          <Text className="font-psemibold text-gray-600">
            TỰ ĐỘNG XÁC NHẬN ĐƠN HÀNG
          </Text>
          <View className="text-gray-700">
            <TouchableOpacity className="flex-row p-1 justify-between items-center mt-1">
              <View className="flex-row gap-x-2 flex-1">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                <Text className={`font-medium italic text-md text-gray-600`}>
                  Đang bật tự động xác nhận đơn
                </Text>
              </View>
              <View className="scale-75 ml-2">
                <Switch
                  color="#e95137"
                  value={isOvernight}
                  onValueChange={onToggleIsOvernight}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row p-1 justify-between items-center mt-1">
              <View className="flex-row gap-x-2 flex-1">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                <Text className={`font-medium italic text-md text-gray-600`}>
                  Tự động xác nhận đơn hàng trong khoảng trước 4h đến 1h trước
                  khung giao hàng
                </Text>
              </View>
              <View className="ml-2">
                <Ionicons size={20} name="chevron-forward-outline" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {}}
              className="flex-row p-1 justify-between items-center mt-1"
            >
              <View className="flex-row gap-x-2 flex-1">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
                <Text
                  className={`font-medium italic text-[12px] text-gray-600`}
                >
                  Lưu ý: tính năng này chỉ hoạt động trong thời gian hoạt động
                  của cửa hàng
                </Text>
              </View>
              <View className="ml-2">
                {/* <Ionicons size={20} name="chevron-forward-outline" /> */}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default Setting;
