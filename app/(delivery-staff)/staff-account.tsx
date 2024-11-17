import { View, Text, Touchable } from "react-native";
import React, { ReactNode } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import sessionService from "@/services/session-service";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StaffAccountAvatarChange from "@/components/common/StaffAccountAvatarChange";
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
  const navigation = useNavigation();
  const redirections = {
    account: [
      {
        text: "Hồ sơ của tôi",
        icon: <Ionicons size={22} name="person-circle-outline" />,
        handlePress: () => router.push("/shop/account"),
        textStyleClasses: "text-gray-800",
      },
      {
        text: "Đăng xuất",
        icon: <Ionicons size={22} name="log-out-outline" />,
        handlePress: () => {
          sessionService.clear();
          navigation.reset({
            index: 0,
            routes: [{ name: "index" }],
          });
        },
        textStyleClasses: "text-gray-600",
      },
    ] as LinkItem[],
  };
  return (
    <View className="p-4 bg-white flex-1">
      <StaffAccountAvatarChange />
      <LinkGroup
        title="TÀI KHOẢN"
        data={redirections.account}
        containerStyleClasses="mt-3"
      />
    </View>
  );
};

export default Account;
