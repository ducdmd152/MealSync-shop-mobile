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
import { Platform, StyleSheet, Text, View } from "react-native";
import { Avatar, Button, IconButton } from "react-native-paper";

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

const AvatarChange: React.FC<AvatarChangeProps> = () => {
  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_PROFILE_FULL_INFO,
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    []
  );
  const [user, setUser] = useState({
    avatarUrl: CONSTANTS.url.shopAvatarSample,
    fullname: shopProfile.data?.value.name || "--------------",
  });
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [avatar, setAvatar] = useState(CONSTANTS.url.avatar);

  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatar(user.avatarUrl);
    }
  }, [user]);

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
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSaveAvatar = async () => {
    try {
      //   const formData = new FormData();
      //   formData.append("avatarImageFile", {
      //     uri: avatar,
      //     type: "image/jpg",
      //     name: "avatar.jpg",
      //   });
      //   const res = await api.put(
      //     `/api/v1/customer/upload/${user?.id}`,
      //     formData,
      //     {
      //       headers: {
      //         "Content-Type": "multipart/form-data",
      //       }
      //     },
      //   );
      //   const data = await res.data;
      //   if (data.isSuccess) {
      //     // dispatch(loaduser());
      //   }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  return (
    <View style={{ alignItems: "center", marginTop: 32 }}>
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
          iconColor={Colors.primaryBackgroundColor}
          size={24}
          style={{ position: "absolute", right: -10, bottom: -10 }}
          onPress={pickImage}
          disabled={!isChangeMode}
        />
      </View>
      <Text style={{ fontSize: 24, marginTop: 16 }}>
        {user?.fullname || "Khách hàng"}
      </Text>

      {isChangeMode ? (
        <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
          <Button
            mode="outlined"
            onPress={() => {
              setAvatar(user?.avatarUrl || CONSTANTS.url.avatar);
              setIsChangeMode(false);
            }}
          >
            Hủy
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              handleSaveAvatar();
              setIsChangeMode(false);
            }}
          >
            Lưu ảnh
          </Button>
        </View>
      ) : (
        <Button onPress={() => setIsChangeMode(true)}>
          Chỉnh sửa hình ảnh
        </Button>
      )}
    </View>
  );
};

export default AvatarChange;
