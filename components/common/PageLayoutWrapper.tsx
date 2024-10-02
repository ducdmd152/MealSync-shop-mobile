import React from "react";
import { SafeAreaView, ScrollView } from "react-native";

interface PageLayoutWrapperProps {
  children: React.ReactNode;
  isScroll?: boolean;
}

const PageLayoutWrapper: React.FC<PageLayoutWrapperProps> = ({
  children,
  isScroll = true,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white relative">
      {isScroll ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
};

export default PageLayoutWrapper;
