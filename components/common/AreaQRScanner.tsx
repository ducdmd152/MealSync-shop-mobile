import { Camera, CameraView } from "expo-camera";
import { Stack, useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "react-native-modal";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
interface AreaQRScannerProps extends ViewProps {
  innerDimension: number;
  handleQRCode: (
    data: string,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) => Promise<boolean>;
}
const AreaQRScanner: React.FC<AreaQRScannerProps> = ({
  innerDimension,
  handleQRCode,
  ...props
}) => {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // useEffect(() => {
  //   const subscription = AppState.addEventListener("change", (nextAppState) => {
  //     if (
  //       appState.current.match(/inactive|background/) &&
  //       nextAppState === "active"
  //     ) {
  //       qrLock.current = false;
  //     }
  //     appState.current = nextAppState;
  //   });

  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [permissionResponse, setPermissionResponse] = useState<any>(null);
  useFocusEffect(
    useCallback(() => {
      console.log("Hello, welcome QR Scanner!");
      qrLock.current = false;
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status == "granted");
        setPermissionResponse(status);
        if (status != "granted")
          Alert.alert("Oops", "Vui lòng cho phép truy cập camera để tiếp tục.");
      })();
    }, []),
  );

  return (
    <View
      style={{
        width: innerDimension,
        height: innerDimension,
        overflow: "hidden",
        borderRadius: 10,
      }}
      {...props}
    >
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data, bounds }) => {
          if (data && !qrLock.current) {
            console.log("QR Code: ", data);
            setIsSubmitting(true);
            qrLock.current = true;

            setTimeout(async () => {
              //   await Linking.openURL(data);

              qrLock.current = true;
              handleQRCode(
                data,
                () => {
                  setIsSubmitting(false);
                },
                (error: any) => {
                  setIsSubmitting(false);
                  Alert.alert(
                    "Oops!",
                    error?.response?.data?.error?.message ||
                      "Yêu cầu bị từ chối, vui lòng thử lại sau!",
                    [
                      {
                        text: "Thử lại",
                        onPress: async () => {
                          setTimeout(() => {
                            qrLock.current = false;
                          }, 1000);
                        },
                      },
                      // {
                      //   text: "Hủy",
                      // },
                    ],
                  );
                },
              );
            }, 100);
          }
        }}
      />
      <Modal
        isVisible={isSubmitting}
        onBackdropPress={() => {}}
        backdropOpacity={0.2}
      >
        <View
          // style={{ flex: 1, zIndex: 100 }}
          className="justify-center items-center"
        >
          <View className="p-4 rounded-md backdrop-blur-sm bg-white/80">
            <Text className="font-medium mb-2">
              Quét mã thành công, đang xử lí yêu cầu
            </Text>
            <ActivityIndicator animating={true} color="#FCF450" />
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default AreaQRScanner;
