import { Ionicons } from "@expo/vector-icons";

import CONSTANTS from "@/constants/data";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import imageService from "@/services/image-service";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  ImageStyle,
  Platform,
  Text,
  View,
  ViewProps,
  ViewStyle,
  TouchableOpacity,
} from "react-native";

import CustomModal from "../common/CustomModal";
interface PreviewImageUploadProps extends ViewProps {
  uris: string[];
  setUris: (uri: string[]) => void;
  isImageHandling: boolean;
  setIsImageHandling: (value: boolean) => void;
  aspect?: [number, number];
  imageWrapperStyle?: ViewStyle;
  imageWrapperStyleClasses?: string;
  imageStyle?: ImageStyle;
  imageStyleClasses?: string;
  isViewOnly?: boolean;
  imageWidth?: number;
  maxNumberOfPics?: number;
  isHideAddWhenMax?: boolean;
  imageHandleError: any;
  setImageHandleError: any;
}
const PreviewMultiImagesUpload = ({
  uris,
  setUris,
  isImageHandling,
  setIsImageHandling,
  aspect = [1, 1],
  imageWrapperStyle = {},
  imageWrapperStyleClasses = "",
  imageStyle = {},
  imageStyleClasses = "",
  imageWidth = 100,
  maxNumberOfPics = 5,
  isHideAddWhenMax = true,
  imageHandleError,
  setImageHandleError,
  ...props
}: PreviewImageUploadProps) => {
  const globalImageViewState = useGlobalImageViewingState();
  const [isSelectPicking, setIsSelectPicking] = useState(false);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  const pickImage = async (isPickByCam: boolean = false) => {
    if (Platform.OS !== "web") {
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus !== "granted") {
        Alert.alert(
          "Oops",
          "Ứng dụng cần truy cập thư viện để hoàn tất tác vụ!"
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
          `Ảnh vượt quá dung lượng cho phép ${CONSTANTS.FILE_CONSTRAINTS.MAX_FILE_SIZE_MB} MB.`
        );
        setIsSelectPicking(true);
        return;
      } else {
        addToList(result.assets[0].uri);
      }
    } else if (!result.canceled) {
      setIsSelectPicking(true);
      Alert.alert("Oops", `Vui lòng thử lại.`);
    }
  };
  // console.log("uris: ", uris);
  const addToList = async (uri: string) => {
    if (uris.includes(uri)) return;
    setIsImageHandling(true);
    const beforeAnyUpdate = [...uris];
    setUris(uris.concat([uri]));
    try {
      const url =
        (await imageService.uploadPreviewImage(uri)) ||
        CONSTANTS.url.noImageAvailable;
      setUris(uris.filter((item) => item != uri).concat([url]));
    } catch (error: any) {
      // console.log(error?.response?.data);
      Alert.alert("Oops!", "Xử lí hình ảnh lỗi, vui lòng thử lại!");
      setUris(beforeAnyUpdate);
      setImageHandleError(true);
    } finally {
      setIsImageHandling(false);
    }
  };

  const removeOutList = (uri: string) => {
    if (!uris.includes(uri)) return;
    setUris(uris.filter((item) => item != uri));
    imageService.deleteImageOnServer(uri);
  };
  return (
    <View {...props}>
      <View
        className={`w-full flex-row flex-wrap gap-y-2 ${imageWrapperStyleClasses}`}
        style={{
          backgroundColor: "white",
          ...imageWrapperStyle,
        }}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setWrapperWidth(width);
        }}
      >
        {uris.map((uri) => (
          <TouchableOpacity
            key={uri}
            className="relative "
            style={{ position: "relative" }}
            onPress={() => {
              globalImageViewState.setUrl(uri);
              globalImageViewState.setDescription("");
              globalImageViewState.setIsModalVisible(true);
            }}
          >
            <Image
              style={{
                height: (aspect[1] / aspect[0]) * imageWidth,
                width: imageWidth,
                zIndex: 2,
                ...imageStyle,
              }}
              className={`w-full justify-center items-center rounded-lg mr-2 ${imageStyle}`}
              resizeMode="cover"
              source={{ uri: uri }}
            />
            <View
              style={{
                position: "absolute",
                top: 1,
                right: 6,
                zIndex: 10,
                padding: 5,
              }}
            >
              <TouchableOpacity
                className="justify-center items-center drop-shadow-md"
                onPress={() => {
                  Alert.alert("Xác nhận", "Bạn muốn xóa hình vừa chọn", [
                    {
                      text: "Đồng ý",
                      onPress: async () => {
                        removeOutList(uri);
                      },
                    },
                    {
                      text: "Hủy",
                    },
                  ]);
                }}
              >
                <Ionicons name="close-outline" size={24} color="#eef2ff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {(uris.length != maxNumberOfPics || isHideAddWhenMax == false) && (
          <TouchableOpacity
            className="overflow-hidden rounded-lg"
            onPress={() => {
              if (uris.length == maxNumberOfPics) {
                Alert.alert(
                  "Oops",
                  `Bạn chỉ có thể chọn tối đa ${maxNumberOfPics} hình ảnh!`
                );
                return;
              }
              setIsSelectPicking(true);
            }}
          >
            <Image
              style={{
                height: (aspect[1] / aspect[0]) * imageWidth,
                width: imageWidth,
                ...imageStyle,
              }}
              className={`w-full justify-center items-center rounded-lg ${imageStyle}`}
              resizeMode="cover"
              source={{ uri: CONSTANTS.url.addNewImage }}
            />
          </TouchableOpacity>
        )}

        {/* <IconButton
          icon="camera"
          iconColor={"#a78bfa"}
          size={24}
          style={{ position: "absolute", right: -10, bottom: -10 }}
          onPress={() => setIsSelectPicking(true)}
        /> */}
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

export default PreviewMultiImagesUpload;
