import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React, { useRef, useState } from "react";
import AvatarChange from "@/components/common/AvatarChange";
import ShopProfileChange from "@/components/shop/ShopProfileChange";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";

const Profile = () => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <ScrollView ref={scrollViewRef}>
        <AvatarChange />
        <ShopProfileChange scrollViewRef={scrollViewRef} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
