import { View, Text, Touchable } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import sessionService from "@/services/session-service";
import { useNavigation } from "expo-router";

const Account = () => {
  const navigation = useNavigation();
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          sessionService.clear();
          navigation.reset({
            index: 0,
            routes: [{ name: "index" }],
          });
        }}
      >
        <Text>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Account;
