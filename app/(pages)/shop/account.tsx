import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import AvatarChange from "@/components/common/AvatarChange";
import ShopProfileChange from "@/components/shop/ShopProfileChange";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import AccountProfileChange from "@/components/shop/AccountProfileChange";

const Account = () => {
  return (
    <PageLayoutWrapper>
      <AvatarChange />
      <AccountProfileChange />
    </PageLayoutWrapper>
  );
};

export default Account;
