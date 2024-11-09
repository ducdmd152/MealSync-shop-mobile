import { Colors } from "@/constants/Colors";
import CONSTANTS from "@/constants/data";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { ShopProfileGetModel } from "@/types/models/ShopProfileModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { Avatar, Button, IconButton } from "react-native-paper";
import CustomButton from "../custom/CustomButton";
import { unSelectLocation } from "@/hooks/states/useMapLocationState";
import Toast from "react-native-toast-message";

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

const AccountAvatarChange: React.FC<AvatarChangeProps> = () => {
  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_PROFILE_FULL_INFO,
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    []
  );
  const [user, setUser] = useState({
    avatarUrl: shopProfile.data?.value.logoUrl || CONSTANTS.url.avatar,
    fullname: shopProfile.data?.value.name || "--------------",
  });
  const [isChangeMode, setIsChangeMode] = useState(true);
  const [avatar, setAvatar] = useState(CONSTANTS.url.avatar);

  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatar(user.avatarUrl);
    }
  }, [user]);
  useEffect(() => {
    if (shopProfile.isFetched && !isChangeMode)
      setUser({
        avatarUrl: shopProfile.data?.value.logoUrl || CONSTANTS.url.avatar,
        fullname: shopProfile.data?.value.name || "------",
      });
  }, [shopProfile.data?.value]);
  useEffect(() => {
    shopProfile.refetch();
  }, [isChangeMode]);

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setAvatar(result.assets[0].uri);
      handleSaveAvatar(result.assets[0].uri);
    }
  };

  const handleSaveAvatar = async (imageURI: string) => {
    try {
      if (!imageURI) {
        Alert.alert("Lỗi", "Không có ảnh nào được chọn.");
        return;
      }

      const response = await fetch(imageURI);
      const blob = await response.blob();
      console.log("blob.size: ", blob.size);

      // Check if file size is within limit (5 MB in bytes)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
      if (blob.size > MAX_FILE_SIZE) {
        Alert.alert("Lỗi", "Ảnh vượt quá dung lượng cho phép 5 MB.");
        return;
      }

      const extension = blob.type === "image/png" ? "png" : "jpg";
      const fileName = `avatar.${extension}`;

      const file = new File([blob], fileName, { type: blob.type });
      const formData = new FormData();
      // formData.append("file", file);
      formData.append("file", blob, fileName);

      // Upload the image
      const res = await apiClient.put("storage/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data as { value: { url: string } };
      console.log("res.data: ", res.data);
      await apiClient
        .put("shop-owner/logo/update", {
          logoUrl: data.value.url,
        })
        .then((res) => {
          console.log(
            "data.value.url: ",
            data.value.url,
            res.data?.value?.logoUrl
          );
        });

      await shopProfile.refetch();
      Toast.show({
        type: "success",
        text1: "Hoàn tất",
        text2: "Cập nhật ảnh đại diện cửa hàng thành công!",
      });
    } catch (error: any) {
      setAvatar(user.avatarUrl);
      console.log(error, error?.response?.data);
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          error?.response?.data?.value?.File[0] ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
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
        <Avatar.Image size={140} source={{ uri: avatar }} />
        <IconButton
          icon="camera"
          iconColor={"#a78bfa"}
          size={24}
          style={{ position: "absolute", right: -10, bottom: -10 }}
          onPress={pickImage}
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

export default AccountAvatarChange;
