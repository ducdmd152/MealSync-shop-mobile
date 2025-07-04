import React from "react";
import { RefreshControlProps, SafeAreaView, ScrollView } from "react-native";

interface PageLayoutWrapperProps {
  children: React.ReactNode;
  isScroll?: boolean;
  refreshControl?: React.ReactElement<
    RefreshControlProps,
    string | React.JSXElementConstructor<any>
  >;
}

const PageLayoutWrapper: React.FC<PageLayoutWrapperProps> = ({
  children,
  isScroll = true,
  refreshControl,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white relative">
      {isScroll ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
};

export default PageLayoutWrapper;
