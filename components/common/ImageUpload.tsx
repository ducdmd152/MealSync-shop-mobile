import { Colors } from "@/constants/Colors";
import CONSTANTS from "@/constants/data";
import * as ImagePicker from "expo-image-picker";
import React, { ReactNode, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton } from "react-native-paper";
import CustomButton from "../custom/CustomButton";

const styles = StyleSheet.create({
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

interface ImageUploadProps {
  uri: string;
  setUri: (uri: string) => void;
  title?: string;
  imageStyleObject?: object;
  aspect?: [number, number];
  editDirection?: ReactNode;
  updateButton?: ReactNode;
  cancelButton?: ReactNode;
  containerStyleClasses?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  uri,
  setUri,
  title,
  imageStyleObject = { height: 60, width: 60 },
  aspect = [1, 1],
  editDirection = (
    <Text className="mt-2 text-md font-semibold text-[#227B94]">Thay đổi</Text>
  ),
  updateButton,
  cancelButton,
  containerStyleClasses = "items-center",
}) => {
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [cacheUri, setCacheUri] = useState(uri);

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus !== "granted") {
        alert("Oops, ứng dụng cần truy cập thư viện để hoàn tất tác vụ!");
        return;
      }

      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== "granted") {
        alert("Oops, ứng dụng cần truy cập camera để hoàn tất tác vụ!");
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: aspect,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setCacheUri(result.assets[0].uri);
    }
  };

  const handleSaveImage = async () => {
    try {
      // const formData = new FormData();
      // formData.append("file", {
      //   uri: cacheUri,
      //   type: cacheUri.endsWith(".png") ? "image/png" : "image/jpeg",
      //   name: cacheUri.endsWith(".png") ? "image.png" : "image.jpg",
      // } as any);

      // const res = await apiClient.put("storage/file/upload", formData, {
      //   headers: {
      //     "Content-type": "multipart/form-data",
      //   },
      // });
      console.log("Cache URI: ", cacheUri);
      setUri(cacheUri);
      console.log("URI: ", uri);
      // Xử lý logic upload hình ảnh
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <View className={containerStyleClasses}>
      <View
        style={{
          ...styles.shadow,
          backgroundColor: "white",
          ...imageStyleObject,
        }}
      >
        <Image
          resizeMode="cover"
          className="h-full w-full "
          source={{
            uri:
              (isChangeMode ? cacheUri : uri) || CONSTANTS.url.noImageAvailable,
          }}
        />
        {/* Đổi avatar thành image */}
        <IconButton
          icon="camera"
          iconColor={Colors.primaryBackgroundColor}
          size={24}
          style={{ position: "absolute", right: -10, bottom: -10 }}
          onPress={pickImage}
          disabled={!isChangeMode}
        />
      </View>

      {isChangeMode ? (
        <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              handleSaveImage();
              setIsChangeMode(false);
            }}
          >
            {updateButton || (
              <CustomButton
                title="Lưu"
                containerStyleClasses="bg-white  bg-[#227B94] h-9"
                textStyleClasses="text-sm text-white"
                handlePress={() => {}}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setCacheUri(uri);
              setIsChangeMode(false);
            }}
          >
            {cancelButton || (
              <CustomButton
                title="Hủy"
                containerStyleClasses="bg-white  border-[2px] boder-[#227B94] h-8 border-gray-300"
                textStyleClasses="text-sm text-[#227B94]"
                handlePress={() => {}}
              />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsChangeMode(true)}>
          {editDirection}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ImageUpload;
