import {
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React, { ReactNode } from "react";
import AvatarImage from "react-native-paper/lib/typescript/components/Avatar/AvatarImage";
import { Avatar, Switch } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
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
      handlePress: () => router.push("/shop/withdrawal"),
      textStyleClasses: "text-gray-800",
    },
  ] as LinkItem[],
  account: [
    {
      text: "Tài khoản của tôi",
      icon: <Ionicons size={20} name="person-circle-outline" />,
      handlePress: () => router.push("/account"),
      textStyleClasses: "text-gray-800",
    },
    {
      text: "Đăng xuất",
      icon: <Ionicons size={20} name="log-out-outline" />,
      handlePress: () => router.replace("/"),
      textStyleClasses: "text-gray-600",
    },
  ] as LinkItem[],
};
const Shop = () => {
  const [isSwitchOn, setIsSwitchOn] = React.useState(true);

  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);
  return (
    <View className="w-full h-full bg-white text-black p-4 relative">
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

      <View className="gap-y-[24px] mt-2 pb-[120px] px-1">
        <LinkGroup
          title="CỬA HÀNG"
          data={redirections.shop}
          containerStyleClasses="mt-4"
        />
        <LinkGroup
          title="TÀI CHÍNH"
          data={redirections.balance}
          containerStyleClasses="mt-4"
        />
        <LinkGroup
          title="TÀI KHOẢN"
          data={redirections.account}
          containerStyleClasses="mt-4"
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
