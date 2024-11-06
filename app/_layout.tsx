import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import FlashMessage from "react-native-flash-message";
import { ToastProvider } from "react-native-toast-notifications";

import { useColorScheme } from "@/hooks/themes/useColorScheme";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { images } from "@/constants";
import { Image } from "react-native";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import TanStackProvider from "@/config/providers/TanStackProvider";
import sessionService from "@/services/session-service";
import OrderDetailBottomSheet from "@/components/target-bottom-sheets/OrderDetailBottomSheet";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);
  const colorScheme = useColorScheme();
  const [isCheckedAuth, setIsCheckedAuth] = useState(false);
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  useEffect(() => {
    setLoaded(fontsLoaded && isCheckedAuth); // list of loaded statuses
  }, [fontsLoaded, isCheckedAuth]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    setIsCheckedAuth(true);
    const checkAuth = async () => {
      const token = await sessionService.getAuthToken();
      if (token) {
        router.replace("/home");
      }
      setIsCheckedAuth(true);
    };

    checkAuth();
  }, []);

  if (!loaded) {
    return (
      <Image
        source={images.splashBg}
        resizeMode="cover"
        className="h-full w-full justify-center items-center"
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TanStackProvider>
        <ThemeProvider value={DefaultTheme}>
          <ToastProvider offset={142}>
            <PaperProvider>
              {/* <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      > */}
              {/* <MagicModalPortal /> */}
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(pages)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <OrderDetailBottomSheet />
              {/* <FlashMessage position="bottom" /> */}
              {/* </KeyboardAvoidingView> */}
            </PaperProvider>
          </ToastProvider>
        </ThemeProvider>
      </TanStackProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: "space-around",
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
    color: "#000",
  },
  textInput: {
    height: 40,
    borderColor: "#00000050",
    borderBottomWidth: 1,
    marginBottom: 36,
    fontSize: 16,
  },
});
