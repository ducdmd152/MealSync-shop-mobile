import { Href, Link, router, Stack } from "expo-router";
import { StyleSheet, Touchable, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/already-components/ThemedText";
import { ThemedView } from "@/components/already-components/ThemedView";
import usePathState from "@/hooks/states/usePathState";

export default function NotFoundScreen() {
  const notFoundInfo = usePathState((state) => state.notFoundInfo);
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">{notFoundInfo.message}</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.link}>
          <ThemedText type="link">{notFoundInfo.linkDesc}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
