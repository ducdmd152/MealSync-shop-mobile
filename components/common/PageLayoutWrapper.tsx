import React from "react";
import { SafeAreaView, ScrollView } from "react-native";

interface PageLayoutWrapperProps {
  children: React.ReactNode;
}

const PageLayoutWrapper: React.FC<PageLayoutWrapperProps> = ({ children }) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PageLayoutWrapper;
