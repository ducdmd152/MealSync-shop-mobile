import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { router } from "expo-router";
import { Colors } from "react-native/Libraries/NewAppScreen";

interface HeaderSimpleProps {
  title: string;
}

const HeaderSimple: React.FC<HeaderSimpleProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <IconButton
        icon="chevron-left"
        iconColor={Colors.primaryBackgroundColor}
        size={60}
        onPress={() => router.back()}
        style={styles.iconButton}
      />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16, // padding: 5 (py-5)
  },
  iconButton: {
    position: "absolute",
    left: 10, // left-1
    borderRadius: 16,
    alignSelf: "center",
  },
  title: {
    fontFamily: "hnow65medium", // Nếu bạn đang sử dụng font này, hãy đảm bảo nó được tải đúng
    fontSize: 20, // text-xl
    color: "#000", // text-black
  },
});

export default HeaderSimple;
