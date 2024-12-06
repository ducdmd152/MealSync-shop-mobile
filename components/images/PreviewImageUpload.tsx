import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

import CONSTANTS from "@/constants/data";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  ImageStyle,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewProps,
  ViewStyle,
  TouchableOpacity,
} from "react-native";

import { IconButton } from "react-native-paper";
import CustomModal from "../common/CustomModal";
export interface PreviewImageUploadProps extends ViewProps {
  uri: string;
  setUri: (uri: string) => void;
  aspect?: [number, number];
  imageWrapperStyle?: ViewStyle;
  imageWrapperStyleClasses?: string;
  imageStyle?: ImageStyle;
  imageStyleClasses?: string;
  isAutoShadow?: boolean;
  afterPickImage?: (uri: string) => void;
  pickIconColor?: string;
}
const imageShadowStyle = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 5, height: 8 },
    shadowColor: Colors.shadow[400],
    shadowOpacity: 0.4,
    elevation: 20,
  },
  shadowSelected: {
    shadowOffset: { width: 8, height: 8 },
    shadowColor: Colors.shadow.DEFAULT,
    shadowOpacity: 0.6,
    elevation: 20,
  },
});
const PreviewImageUpload = ({
  uri,
  setUri,
  aspect = [1, 1],
  imageWrapperStyle = {},
  imageWrapperStyleClasses = "",
  imageStyle = {},
  imageStyleClasses = "",
  afterPickImage = (uri: string) => {},
  isAutoShadow = false,
  pickIconColor = "#a78bfa",
  ...props
}: PreviewImageUploadProps) => {
  const [isSelectPicking, setIsSelectPicking] = useState(false);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  const pickImage = async (isPickByCam: boolean = false) => {
    if (Platform.OS !== "web") {
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus !== "granted") {
        Alert.alert(
          "Oops",
          "Ứng dụng cần truy cập thư viện để hoàn tất tác vụ!",
        );
        return;
      }

      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== "granted") {
        Alert.alert("Oops", "Ứng dụng cần truy cập camera để hoàn tất tác vụ!");
        return;
      }
    }

    let result = isPickByCam
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: aspect,
          quality: 0.5,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: aspect,
          quality: 0.5,
        });
    setIsSelectPicking(false);
    if (!result.canceled && result.assets) {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      if (blob.size > CONSTANTS.FILE_CONSTRAINTS.MAX_FILE_SIZE_BYTE) {
        Alert.alert(
          "Oops",
          `Ảnh vượt quá dung lượng cho phép ${CONSTANTS.FILE_CONSTRAINTS.MAX_FILE_SIZE_MB} MB.`,
        );
        setIsSelectPicking(true);
        return;
      } else {
        setUri(result.assets[0].uri);
        afterPickImage(result.assets[0].uri);
      }
    } else if (!result.canceled) {
      setIsSelectPicking(true);
      Alert.alert("Oops", `Vui lòng thử lại.`);
    }
  };
  return (
    <View {...props}>
      <View
        className={`w-full ${imageWrapperStyleClasses}`}
        style={{
          backgroundColor: "white",
          ...(isAutoShadow ? imageShadowStyle.shadow : {}),
          ...imageWrapperStyle,
        }}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setWrapperWidth(width);
        }}
      >
        <Image
          style={{
            height: (aspect[1] / aspect[0]) * wrapperWidth,
            width: wrapperWidth,
            ...imageStyle,
          }}
          className={`w-full justify-center items-center ${imageStyle}`}
          resizeMode="cover"
          source={{ uri: uri }}
        />
        <IconButton
          icon="camera"
          iconColor={pickIconColor}
          size={24}
          style={{ position: "absolute", right: -10, bottom: -10 }}
          onPress={() => setIsSelectPicking(true)}
        />
      </View>
      <CustomModal
        title=""
        hasHeader={false}
        isOpen={isSelectPicking}
        setIsOpen={(value) => setIsSelectPicking(value)}
        titleStyleClasses="text-center flex-1"
        containerStyleClasses="w-72"
        onBackdropPress={() => {
          setIsSelectPicking(false);
        }}
      >
        <Text className="text-center text-[12px] font-semibold">
          Chọn hình ảnh
        </Text>
        <View className="flex-row items-center justify-center gap-x-8 mt-4 p-2">
          <TouchableOpacity
            onPress={() => pickImage(true)}
            className="justify-center items-center bg-[#fefce8] p-2 w-[100px] rounded-lg"
          >
            <Ionicons name="camera-outline" size={40} color="#fb923c" />
            <Text className="mt-1">Chụp hình</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => pickImage(false)}
            className="justify-center items-center bg-[#fefce8] p-2 w-[100px] rounded-lg"
          >
            <Ionicons name="images-outline" size={40} color="#fb923c" />
            <Text className="mt-1">Thư viện</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </View>
  );
};

export default PreviewImageUpload;
