import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import AvatarChange from "@/components/common/AvatarChange";
import ShopProfileChange from "@/components/shop/ShopProfileChange";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";

const Profile = () => {
  return (
    <PageLayoutWrapper>
      <AvatarChange />
      <ShopProfileChange />
    </PageLayoutWrapper>
  );
};

export default Profile;
