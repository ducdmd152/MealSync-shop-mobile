import { Camera, CameraView } from "expo-camera";
import { Stack } from "expo-router";
import {
  AppState,
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ViewProps,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { ScanOverlay } from "@/components/common/ScanOverlay";
import { rect, rrect } from "@shopify/react-native-skia";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
interface AreaQRScannerProps extends ViewProps {
  innerDimension: number;
}
const AreaQRScanner: React.FC<AreaQRScannerProps> = ({
  innerDimension,
  ...props
}) => {
  const boxRef = useRef<View | null>(null);
  const outer = rrect(rect(0, 0, screenWidth, screenHeight), 0, 0);
  const [inner, setInner] = useState(
    rrect(
      rect(
        screenWidth / 2 - innerDimension / 2,
        screenWidth / 2 - innerDimension / 2,
        innerDimension,
        innerDimension
      ),
      50,
      50
    )
  );
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.measure((x, y, width, height, pageX, pageY) => {
        setInner(
          rrect(rect(pageX, pageY, innerDimension, innerDimension), 50, 50)
        );
      });
    }
  }, [boxRef.current]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isQRInsideInnerRect = (
    qrX: number,
    qrY: number,
    qrWidth: number,
    qrHeight: number
  ): boolean => {
    return (
      qrX >= inner.rect.x &&
      qrY >= inner.rect.y &&
      qrX + qrWidth <= inner.rect.x + innerDimension &&
      qrY + qrHeight <= inner.rect.y + innerDimension
    );
  };

  return (
    <View
      ref={boxRef}
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
          if (
            // isQRInsideInnerRect(
            //   bounds.origin.x,
            //   bounds.origin.y,
            //   bounds.size.width,
            //   bounds.size.height
            // ) &&
            data &&
            !qrLock.current
          ) {
            console.log(
              "This component : ",
              inner.rect.x,
              inner.rect.y,
              inner.rect.x + innerDimension,
              inner.rect.y + innerDimension
            );
            console.log(
              "isQRInsideInnerRect : ",
              bounds.origin.x,
              bounds.origin.y,
              bounds.size.width,
              bounds.size.height
            );
            // qrLock.current = true;
            setTimeout(async () => {
              //   await Linking.openURL(data);
              console.log("QR Code: ", data);
            }, 500);
          }
        }}
      />
    </View>
  );
};
export default AreaQRScanner;
