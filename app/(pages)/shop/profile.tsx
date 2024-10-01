import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import AvatarChange from "@/components/common/AvatarChange";

const Profile = () => {
  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <AvatarChange />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
