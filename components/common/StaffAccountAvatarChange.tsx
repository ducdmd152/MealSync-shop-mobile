import { Colors } from "@/constants/Colors";
import CONSTANTS from "@/constants/data";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { getExtensionFromMimeType } from "@/services/image-service";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, IconButton } from "react-native-paper";
import Toast from "react-native-toast-message";
import CustomModal from "./CustomModal";

import { ShopDeliveryStaffModel } from "@/types/models/StaffInfoModel";
import { useFocusEffect } from "expo-router";
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

interface AvatarChangeProps {}

const StaffAccountAvatarChange: React.FC<AvatarChangeProps> = () => {
  const staffAccount = useFetchWithRQWithFetchFunc(
    [endpoints.STAFF_INFO],
    async (): Promise<FetchValueResponse<ShopDeliveryStaffModel>> =>
      apiClient.get(endpoints.STAFF_INFO).then((response) => response.data),
    []
  );
  const [user, setUser] = useState({
    avatarUrl:
      staffAccount.data?.value.avatarUrl || CONSTANTS.url.avatarDefault,
    fullname: staffAccount.data?.value.fullName || "--------------",
  });
  const [isChangeMode, setIsChangeMode] = useState(true);
  const [avatar, setAvatar] = useState(CONSTANTS.url.avatar);
  const [isTakeFromCamera, setIsTakeFromCamera] = useState(true);
  const [isPicking, setIsPicking] = useState(false);
  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatar(user.avatarUrl);
    }
  }, [user]);
  useEffect(() => {
    if (staffAccount.isFetched && !isChangeMode)
      setUser({
        avatarUrl:
          staffAccount.data?.value.avatarUrl || CONSTANTS.url.avatarDefault,
        fullname: staffAccount.data?.value.fullName || "--------------",
      });
  }, [staffAccount.data?.value]);
  useEffect(() => {
    staffAccount.refetch();
  }, [isChangeMode]);
  useFocusEffect(
    React.useCallback(() => {
      if (staffAccount.isFetched) staffAccount.refetch();
    }, [])
  );

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

    if (isPickByCam) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        handleSaveAvatar(result.assets[0].uri);
      }
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        handleSaveAvatar(result.assets[0].uri);
      }
    }
  };

  const handleSaveAvatar = async (imageURI: string) => {
    try {
      setIsPicking(false);
      if (!imageURI) {
        Alert.alert("Oops", "Không có ảnh nào được chọn.");
        return;
      }

      const response = await fetch(imageURI);
      const blob = await response.blob();
      // console.log("blob.size: ", blob.size);

      // Check if file size is within limit (5 MB in bytes)
      if (blob.size > CONSTANTS.FILE_CONSTRAINTS.MAX_FILE_SIZE_BYTE) {
        Alert.alert(
          "Oops",
          `Ảnh vượt quá dung lượng cho phép ${CONSTANTS.FILE_CONSTRAINTS.MAX_FILE_SIZE_MB} MB.`
        );
        return;
      }
      setAvatar(imageURI);
      const fileName = `shop-owner-avatar.${getExtensionFromMimeType(
        blob.type
      )}`;
      const formData = new FormData();
      formData.append("file", {
        uri: imageURI,
        name: fileName,
        type: blob.type,
      } as any);
      // Upload the image
      // const res = await apiClient.put("storage/file/upload", formData, {
      //   headers: {
      //     Authorization: `Bearer ${await sessionService.getAuthToken()}`,
      //     "Content-Type": "multipart/form-data",
      //   },
      // });

      // const data = res.data as { value: { avatarUrl: string } };
      await apiClient
        .put(endpoints.ACCOUNT_AVATAR_UPDATE, formData)
        .then((res) => {
          // console.log(
          //   "data.value.url: ",
          //   data.value.url,
          //   res.data?.value?.logoUrl
          // );
        });
      Toast.show({
        type: "success",
        text1: "Hoàn tất",
        text2: "Cập nhật ảnh đại diện thành công!",
      });
    } catch (error: any) {
      setAvatar(user.avatarUrl);
      // console.log(error, error?.response?.data);
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          error?.response?.data?.value?.File[0] ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
    } finally {
      staffAccount.refetch();
    }
  };

  return (
    <View
      style={{ alignItems: "center", marginTop: 32 }}
      className={`${isChangeMode && "mb-3"}`}
    >
      <View
        style={{
          ...styles.shadow,
          backgroundColor: "white",
          borderRadius: 100,
        }}
      >
        <CustomModal
          title="     Chọn hình ảnh"
          hasHeader={false}
          isOpen={isPicking}
          setIsOpen={(value) => setIsPicking(value)}
          titleStyleClasses="text-center flex-1"
          containerStyleClasses="w-72"
          onBackdropPress={() => {
            console.log("-------");
            setIsPicking(false);
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
        <Avatar.Image size={140} source={{ uri: avatar }} />
        <IconButton
          icon="camera"
          iconColor={"#a78bfa"}
          size={24}
          style={{ position: "absolute", right: -10, bottom: -10 }}
          onPress={() => setIsPicking(true)}
          disabled={!isChangeMode}
        />
      </View>
      <Text style={{ fontSize: 24, marginTop: 16 }}>
        {user?.fullname || "Khách hàng"}
      </Text>

      {/* {!isChangeMode ? (
        <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
          <CustomButton
            title="Lưu ảnh"
            containerStyleClasses="bg-white  bg-[#227B94] h-7"
            textStyleClasses="text-[14px] text-white"
            handlePress={() => {
              handleSaveAvatar();
            }}
          />
          <CustomButton
            title="Hủy"
            containerStyleClasses="bg-white  border-[2px] boder-[#227B94] h-7 border-gray-300"
            textStyleClasses="text-[14px] text-[#227B94] mt-[-1.5px]"
            handlePress={() => {
              setAvatar(user?.avatarUrl || CONSTANTS.url.avatar);
              setIsChangeMode(false);
            }}
          />
        </View>
      ) : (
        <Button onPress={() => setIsChangeMode(true)} textColor="#a78bfa">
          Chỉnh sửa hình ảnh
        </Button>
      )} */}
    </View>
  );
};

export default StaffAccountAvatarChange;
