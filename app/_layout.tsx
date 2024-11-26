import OrderDetailBottomSheet from "@/components/target-bottom-sheets/OrderDetailBottomSheet";
import CompleteDeliveryConfirmModal from "@/components/target-modals/CompleteDeliveryConfirmModal";
import ImageViewingModal from "@/components/target-modals/ImageViewingModal";
import ReviewReplyModal from "@/components/target-modals/ReviewReplyModal";
import StaffDetailsModal from "@/components/target-modals/StaffDetailsModal";
import WithdrawDetailsModal from "@/components/target-modals/WithdrawDetailsModal";
import TanStackProvider from "@/config/providers/TanStackProvider";
import { images } from "@/constants";
import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
import useGlobalNotiState from "@/hooks/states/useGlobalNotiState";
import useGlobalSocketState from "@/hooks/states/useGlobalSocketState";
import useOrderDetailPageState from "@/hooks/states/useOrderDetailPageState";
import { useColorScheme } from "@/hooks/themes/useColorScheme";
import sessionService from "@/services/session-service";
import { NotiEntityTypes, NotiModel } from "@/types/models/ChatModel";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import messaging from "@react-native-firebase/messaging";
import {
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Alert, Image, PermissionsAndroid, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { ToastProvider } from "react-native-toast-notifications";
import { io } from "socket.io-client";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const requestUserPermissions = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  if (enabled) {
    console.log("Authorization status:", authStatus);
  }
};

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);
  const colorScheme = useColorScheme();
  const [isCheckedAuth, setIsCheckedAuth] = useState(false);
  const [isQueryProviderReady, setQueryProviderReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(true);
  const globalAuthState = useGlobalAuthState();
  const globalSocketState = useGlobalSocketState();
  const globalNotiState = useGlobalNotiState();
  const [isReady, setIsReady] = useState(false);
  const globalOrderDetailPageState = useOrderDetailPageState();

  // const [fontsLoaded, error] = useFonts({
  //   "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
  //   "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  //   "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
  //   "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
  //   "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
  //   "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
  //   "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  //   "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  //   "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  // });

  useEffect(() => {
    // FIREBASE NOTIFICATION
    messaging()
      .getInitialNotification()
      .then((notification) => {
        console.log(notification);
      });
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(remoteMessage, "on open");
    });
    messaging().setBackgroundMessageHandler(async (msg) => {
      console.log(msg, "in background");
    });
    const unsubscribe = messaging().onMessage(async (msg) => {});
    return unsubscribe;
  }, []);

  useEffect(() => {
    setLoaded(fontsLoaded && isCheckedAuth); // list of loaded statuses
  }, [fontsLoaded, isCheckedAuth]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await sessionService.getAuthToken();
      if (!token) {
        setIsCheckedAuth(true);
        return;
      }
      const roleId = await sessionService.getAuthRole();
      globalAuthState.setToken(token);
      globalAuthState.setRoleId(roleId);
      if (roleId == 2) {
        router.replace("/home");
      }
      if (roleId == 3) router.replace("/staff-home");
      else {
      }
      setIsCheckedAuth(true);
    };

    checkAuth();
  }, []);
  useEffect(() => {
    if (!isReady || !globalAuthState.token) return;
    requestUserPermissions();
    messaging()
      .getToken()
      .then((token) => {
        console.log(token, " device tokenn");
        if (globalAuthState.token)
          sessionService.handleRegistrationDevice(token);
      })
      .catch((err) => {
        console.log(err, " cannot register device in message()");
      });
  }, [isReady, globalAuthState.token]);

  useEffect(() => {
    setIsReady(true); // all provider ready
  }, []);
  useEffect(() => {
    async () => {
      globalAuthState.setToken((await sessionService.getAuthToken()) || "");
      globalAuthState.setRoleId(await sessionService.getAuthRole());
    };
  }, []);
  const { socket, setSocket } = globalSocketState; // Use Socket type from socket.io-client
  const initializeSocket = async () => {
    const token = await globalAuthState.token; // Retrieve token from AsyncStorage
    if (!token) return;
    try {
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return;
      }

      // Connect to the server with JWT authentication
      const newSocket = io("https://socketio.mealsync.org/", {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
      });

      globalSocketState.setSocket(newSocket);

      // Listen for notifications from the server
      newSocket.on("notification", (noti: any) => {
        try {
          globalNotiState.setToggleChangingFlag(false);
          globalNotiState.setToggleChangingFlag(true);
          Toast.show({
            type: "info",
            text1: `${noti.Title}${
              noti.EntityType == NotiEntityTypes.Order
                ? ` MS-${noti.ReferenceId}`
                : ""
            }`,
            text2: noti.Content,
            onPress() {
              if (noti.EntityType == NotiEntityTypes.Order) {
                globalOrderDetailPageState.setOrder({} as OrderDetailModel);
                globalOrderDetailPageState.setId(noti.ReferenceId);
                router.push("/order/details");
              }
            },
          });
        } catch (err) {
          console.error("Failed to show toastable:", err);
        }
      });

      // Handle connection errors
      newSocket.on("connect_error", (error: Error) => {
        console.error("Connection Error:", error);
        // Alert.alert("Connection Error", error.message);
      });

      // Save socket instance for cleanup
      setSocket(newSocket);
    } catch (error) {
      globalSocketState.setSocket(null);
      console.log("Error retrieving token:", error);
      Alert.alert("Error", "Failed to retrieve token. Please log in again.");
    }
  };
  useEffect(() => {
    // Function to initialize socket connection with token from AsyncStorage

    initializeSocket();

    // Cleanup function to disconnect the socket on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [globalAuthState.token]); // Empty dependency array to run once on mount and when globalAuthState.token update
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
      {/* <SafeAreaView style={{ flex: 1 }}> */}
      <TanStackProvider>
        <ThemeProvider value={DefaultTheme}>
          <ToastProvider offset={120}>
            <PaperProvider>
              {/* <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      > */}
              {/* <MagicModalPortal /> */}
              <NavigationContainer>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(pages)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(delivery-staff)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <OrderDetailBottomSheet />
                <ImageViewingModal />
                <ReviewReplyModal />
                <StaffDetailsModal />
                <WithdrawDetailsModal titleStyleClasses="font-semibold" />
                <CompleteDeliveryConfirmModal />
              </NavigationContainer>
              {/* <FlashMessage position="bottom" /> */}
              {/* </KeyboardAvoidingView> */}
            </PaperProvider>
          </ToastProvider>
        </ThemeProvider>
      </TanStackProvider>
      <Toast />
      {/* </SafeAreaView> */}
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
