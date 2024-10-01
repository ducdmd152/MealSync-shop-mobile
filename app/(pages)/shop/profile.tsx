import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React from "react";

const Profile = () => {
  return (
    <SafeAreaView className="h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <Text>Shop Profile</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
