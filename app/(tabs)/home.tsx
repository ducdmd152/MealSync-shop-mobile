import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { ThemedText } from "@/components/already-components/ThemedText";

export default function HomeScreen() {
  return (
    <View className="w-full h-full flex-1 items-center justify-center bg-white">
      <StatusBar style="auto" />
      <Text className="text-3xl text-white">Aora!</Text>
      <Link href="/profile" style={{ color: "blue" }}>
        Profile
      </Link>
    </View>
  );
}
