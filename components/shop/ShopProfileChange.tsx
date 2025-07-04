import CONSTANTS from "@/constants/data";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import useMapLocationState, {
  unSelectLocation,
} from "@/hooks/states/useMapLocationState";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import imageService from "@/services/image-service";
import {
  Dormitories,
  ShopProfileGetModel,
} from "@/types/models/ShopProfileModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";

import Toast from "react-native-toast-message";
import { useToast } from "react-native-toast-notifications";
import CustomButton from "../custom/CustomButton";
import FormFieldCustom from "../custom/FormFieldCustom";
import SampleCustomCheckbox from "../custom/SampleCustomCheckbox";
import PreviewImageUpload from "../images/PreviewImageUpload";
interface ShopProfileUpdateModel {
  shopName: string;
  shopOwnerName: string;
  dormitoryIds: number[];
  logoUrl: string;
  bannerUrl: string;
  description: string;
  phoneNumber: string;
  location: {
    id: number;
    address: string;
    latitude: number;
    longitude: number;
  };
}

const emptyShopProfileUpdate: ShopProfileUpdateModel = {
  shopName: "",
  shopOwnerName: "",
  dormitoryIds: [],
  logoUrl: "",
  bannerUrl: "",
  description: "",
  phoneNumber: "",
  location: {
    id: 0,
    address: "",
    latitude: 0,
    longitude: 0,
  },
};

const ShopProfileChange = ({ scrollViewRef }: { scrollViewRef: any }) => {
  const toast = useToast();
  const globalMapState = useMapLocationState();
  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_PROFILE_FULL_INFO,
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    []
  );
  const [model, setModel] = useState<ShopProfileUpdateModel>(
    emptyShopProfileUpdate
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAnyRequestSubmit = useRef(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUnderKeywodFocusing, setIsUnderKeywodFocusing] = useState(false);
  useEffect(() => {
    // console.log(isUnderKeywodFocusing);
    if (isUnderKeywodFocusing && scrollViewRef?.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isUnderKeywodFocusing, scrollViewRef]);
  useEffect(() => {
    if (isEditMode)
      setModel({
        ...model,
        location: {
          ...model.location,
          id: globalMapState.id,
          address: globalMapState.address,
          longitude: globalMapState.longitude,
          latitude: globalMapState.latitude,
        },
      });
  }, [globalMapState]);
  const getModelFromFetch = () => {
    // console.log("Profile: ", {
    //   shopName: shopProfile.data?.value.name || "",
    //   shopOwnerName: shopProfile.data?.value.shopOwnerName || "",
    //   dormitoryIds:
    //     shopProfile.data?.value.shopDormitories.map(
    //       (item) => item.dormitoryId
    //     ) || [],
    //   logoUrl: shopProfile.data?.value.logoUrl || "",
    //   bannerUrl: shopProfile.data?.value.bannerUrl || "",
    //   description: shopProfile.data?.value.description || "", // shop infor not return
    //   phoneNumber: shopProfile.data?.value.phoneNumber || "",
    //   location: shopProfile.data?.value.location || unSelectLocation,
    // });
    return {
      shopName: shopProfile.data?.value.name || "",
      shopOwnerName: shopProfile.data?.value.shopOwnerName || "",
      dormitoryIds:
        shopProfile.data?.value.shopDormitories.map(
          (item) => item.dormitoryId
        ) || [],
      logoUrl: shopProfile.data?.value.logoUrl || "",
      bannerUrl: shopProfile.data?.value.bannerUrl || "",
      description: shopProfile.data?.value.description || "", // shop infor not return
      phoneNumber: shopProfile.data?.value.phoneNumber || "",
      location: shopProfile.data?.value.location || unSelectLocation,
    } as ShopProfileUpdateModel;
  };
  useEffect(() => {
    shopProfile.refetch();
    setModel(getModelFromFetch());
    isAnyRequestSubmit.current = false;
  }, [isEditMode]);
  useEffect(() => {
    if (!shopProfile.isFetching && !isEditMode) setModel(getModelFromFetch());
  }, [shopProfile.isFetching]);
  useFocusEffect(
    React.useCallback(() => {
      shopProfile.refetch();
    }, [])
  );

  const [errors, setErrors] = useState<any>({});
  const validate = (profile: ShopProfileUpdateModel) => {
    let tempErrors: any = {};
    if (profile.shopName.length < 6)
      tempErrors.shopName = "Tên cửa hàng dài ít nhất 6 kí tự.";
    if (!CONSTANTS.REGEX.phone.test(profile.phoneNumber))
      tempErrors.phoneNumber = "Số điện thoại không hợp lệ.";
    if (profile.shopOwnerName.length < 6)
      tempErrors.shopOwnerName = "Tên chủ cửa hàng dài ít nhất 4 kí tự.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const onFieldChange = (change: ShopProfileUpdateModel) => {
    if (isAnyRequestSubmit.current) {
      validate(change);
    }
  };
  const handleUpdate = async () => {
    isAnyRequestSubmit.current = true;
    if (!validate(model)) {
      Alert.alert("Vui lòng hoàn thành thông tin hợp lệ");
      return;
    }
    if (model.dormitoryIds.length == 0) {
      Alert.alert("Vui lòng chọn ít nhất một khu bán hàng");
      return;
    }
    setIsSubmitting(true);
    try {
      apiClient
        .put("shop-owner/profile", {
          ...model,
          bannerUrl:
            shopProfile.data?.value.bannerUrl == model.bannerUrl
              ? model.bannerUrl
              : await imageService.uploadPreviewImage(model.bannerUrl),
        })
        .then(() => {
          setIsEditMode(false);
          Toast.show({
            type: "success",
            text1: "Hoàn tất",
            text2: `Cập nhật hồ sơ thành công!.`,
          });
        });
    } catch (error: any) {
      console.log(error?.response?.data);
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <View
      className={`w-full px-4 py-2 ${isUnderKeywodFocusing && "pb-[160px]"}`}
    >
      {!isEditMode && (
        <TouchableOpacity
          className="mt-[-20px] "
          onPress={() => {
            setIsEditMode(true);
            toast.show(
              `Bạn đang trong chế độ chỉnh sửa, vui lòng thay đổi và cập nhật thông tin.`,
              {
                type: "normal",
                duration: 3000,
                normalColor: "#06b6d4",
              }
            );
          }}
        >
          <Text className="text-center text-[#818cf8] font-semibold mt-2">
            Chỉnh sửa hồ sơ
          </Text>
        </TouchableOpacity>
      )}
      <FormFieldCustom
        title={"Tên cửa hàng"}
        value={model.shopName}
        readOnly={!isEditMode}
        placeholder={"Nhập tên cửa hàng..."}
        handleChangeText={(text) => {
          setModel({ ...model, shopName: text });
          onFieldChange({ ...model, shopName: text });
        }}
        keyboardType="default"
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100 "
        // className="mb-1"
      />
      {errors.shopName && (
        <Text className="text-red-500 text-xs mt-1">{errors.shopName}</Text>
      )}
      <View className="mb-2">
        <FormFieldCustom
          title={"Mô tả cửa hàng"}
          value={model.shopName}
          readOnly={!isEditMode}
          placeholder={""}
          handleChangeText={(text) => {}}
          keyboardType="default"
          otherStyleClasses="mt-3"
          otherInputStyleClasses="h-12 border-gray-100"
          labelOnly={true}
        />
        <TextInput
          className="border border-gray-300 mt-1 p-2 rounded h-16 rounded-2xl border-2 border-gray-300 p-3"
          placeholder="Nhập mô tả..."
          value={model.description}
          onChangeText={(text) => {
            setModel({ ...model, description: text });
          }}
          multiline
          placeholderTextColor="#888"
        />
      </View>

      <FormFieldCustom
        title={"Địa chỉ cửa hàng"}
        value={model.location.address || ""}
        readOnly={true}
        placeholder={"Chọn địa chỉ cửa hàng..."}
        handleChangeText={(text) => {
          setModel({
            ...model,
            location: { ...model.location, address: text },
          });
        }}
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
        // className="mb-1"
        iconRight={
          isEditMode ? (
            <View className="pl-2">
              <TouchableOpacity
                onPress={() => {
                  globalMapState.setId(model.location.id);
                  globalMapState.setLocation(
                    model.location.address,
                    model.location.latitude,
                    model.location.longitude
                  );
                  router.push("/map");
                }}
                className="h-[32px] w-[32px] bg-primary rounded-md justify-center items-center relative"
              >
                <Ionicons name="location-outline" size={28} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View></View>
          )
        }
      />
      <View className={`gap-y-0 mt-3`}>
        <Text className="text-base text-gray-500 font-medium">
          Khu vực bán hàng
        </Text>

        <View className="flex-row gap-x-8 ml-[2px]">
          <SampleCustomCheckbox
            readOnly={!isEditMode}
            checked={model.dormitoryIds.includes(Dormitories.A)}
            onToggle={() => {
              if (!model.dormitoryIds.includes(Dormitories.A))
                setModel({
                  ...model,
                  dormitoryIds: model.dormitoryIds.concat([Dormitories.A]),
                });
              else
                setModel({
                  ...model,
                  dormitoryIds: model.dormitoryIds.filter(
                    (item) => item != Dormitories.A
                  ),
                });
            }}
            label={<Text className="text-[16px]">Khu A</Text>}
            containerStyleClasses={"w-[100px]"}
          />
          <SampleCustomCheckbox
            checked={model.dormitoryIds.includes(Dormitories.B)}
            onToggle={() => {
              if (!model.dormitoryIds.includes(Dormitories.B))
                setModel({
                  ...model,
                  dormitoryIds: model.dormitoryIds.concat([Dormitories.B]),
                });
              else
                setModel({
                  ...model,
                  dormitoryIds: model.dormitoryIds.filter(
                    (item) => item != Dormitories.B
                  ),
                });
            }}
            label={<Text className="text-[16px]">Khu B</Text>}
            containerStyleClasses={"w-[100px]"}
            readOnly={!isEditMode}
          />
        </View>
      </View>

      <FormFieldCustom
        title={"Số điện thoại"}
        value={model.phoneNumber}
        placeholder={"Nhập số điện thoại..."}
        handleChangeText={(text) => {
          setModel({ ...model, phoneNumber: text });
          onFieldChange({ ...model, phoneNumber: text });
        }}
        keyboardType="email-address"
        otherStyleClasses="mt-3"
        otherInputStyleClasses="h-12 border-gray-100"
        readOnly={!isEditMode}
        // className="mb-1"
      />
      {errors.phoneNumber && (
        <Text className="text-red-500 text-xs mt-1">{errors.phoneNumber}</Text>
      )}

      <FormFieldCustom
        title={"Chủ cửa hàng (bạn)"}
        value={model.shopOwnerName}
        placeholder={"Nhập tên chủ cửa hàng..."}
        handleChangeText={(text) => {
          setModel({ ...model, shopOwnerName: text });
          onFieldChange({ ...model, shopOwnerName: text });
        }}
        keyboardType="default"
        otherStyleClasses="mt-2"
        otherInputStyleClasses="h-12 border-gray-100"
        readOnly={!isEditMode}
        // className="mb-1"
        onFocus={() => setIsUnderKeywodFocusing(true)}
        onBlur={() => setIsUnderKeywodFocusing(false)}
      />
      {errors.shopOwnerName && (
        <Text className="text-red-500 text-xs mt-1">
          {errors.shopOwnerName}
        </Text>
      )}
      <View className={` mt-3`}>
        <Text className="text-base text-gray-500 font-medium">Banner</Text>
        {isEditMode ? (
          <PreviewImageUpload
            className="flex-row w-full justify-center items-center overflow-hidden ml-[2px] border-2 rounded-lg border-gray-300 mt-1"
            aspect={[1, 1 / (16 / 9)]}
            uri={model.bannerUrl || "string"}
            setUri={(uri: string) => {
              setModel({ ...model, bannerUrl: uri });
              // console.log("uri: ", uri);
            }}
          />
        ) : (
          <View className="flex-row overflow-hidden ml-[2px] border-2 rounded-lg border-gray-300 mt-1">
            <Image
              source={{ uri: model.bannerUrl || "string" }}
              resizeMode="cover"
              className="h-40 w-full justify-center items-center"
            />
          </View>
        )}
      </View>
      {isEditMode && (
        <CustomButton
          title="Cập nhật"
          isLoading={isSubmitting}
          containerStyleClasses="mt-5 bg-secondary h-12"
          textStyleClasses="text-white"
          handlePress={() => {
            handleUpdate();
          }}
        />
      )}
      {isEditMode && (
        <CustomButton
          title="Hủy"
          handlePress={() => {
            setIsEditMode(false);
          }}
          containerStyleClasses="mt-2 w-full h-[44px] px-4 bg-transparent border-[1px] border-gray-400 font-semibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[17px] text-gray-900 ml-1 text-white text-gray-500"
        />
      )}
    </View>
  );
};

export default ShopProfileChange;
