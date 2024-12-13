import { View, Text, Alert, TextInput } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Avatar from "react-native-paper/lib/typescript/components/Avatar/AvatarIcon";
import AvatarChange from "@/components/common/AvatarChange";
import ImageUpload from "@/components/common/ImageUpload";
import CustomButton from "@/components/custom/CustomButton";
import FormField from "@/components/custom/FormFieldCustom";
import CustomDropdown from "@/components/custom/CustomDropdown";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import {
  MultipleSelectList,
  SelectList,
} from "react-native-dropdown-select-list";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Modal, Portal, Switch } from "react-native-paper";
import sessionService from "@/services/session-service";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { ShopCategoryModel } from "@/types/models/ShopCategoryModel";
import APICommonResponse from "@/types/responses/APICommonResponse";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import { PlatformCategoryModel } from "@/types/models/PlatformCategory";
import OptionGroupModel from "@/types/models/OptionGroupModel";
import * as Yup from "yup";
import FetchResponse, {
  FetchOnlyListResponse,
} from "@/types/responses/FetchResponse";
import { OperatingSlotModel } from "@/types/models/OperatingSlotModel";
import { useFormik } from "formik";
import useModelState from "@/hooks/states/useModelState";
import CustomMultipleSelectList from "@/components/custom/CustomMultipleSelectList";
import PreviewImageUpload from "@/components/images/PreviewImageUpload";
import imageService from "@/services/image-service";
import CONSTANTS from "@/constants/data";
import { TouchableOpacity } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import CustomModal from "@/components/common/CustomModal";
import { FoodPackingUnit } from "@/types/models/FoodPackagingUnitModel";
import ShopContainerManagement from "@/components/menu/ShopContainerManagement";
import { useToast } from "react-native-toast-notifications";
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(6, "Tên món phải từ 6 kí tự trở lên")
    .required("Tên món là bắt buộc"),
  price: Yup.number().min(1, "Giá phải lớn hơn 0").required("Giá là bắt buộc"),
  platformCategoryId: Yup.number().min(0, "Danh mục hệ thống là bắt buộc"),
  shopCategoryId: Yup.number().min(0, "Danh mục cửa hàng là bắt buộc"),
  foodPackingUnitId: Yup.number().min(0, "Khối lượng quy đổi là bắt buộc"),
});
const formatPrice = (value: number) => {
  // console.log(
  //   "Price:",
  //   value,
  //   new Intl.NumberFormat("vi-VN", {
  //     style: "decimal",
  //     maximumFractionDigits: 0,
  //   }).format(value)
  // );
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
};
const parseFormattedNumber = (formattedValue: string) => {
  return Number(formattedValue.replace(/\./g, ""));
};
interface ShopCategoryListResponse extends APICommonResponse {
  value: ShopCategoryModel[];
}
interface PlatformCategoryListResponse extends APICommonResponse {
  value: PlatformCategoryModel[];
}

const FoodUpdate = () => {
  const toast = useToast();
  const [isCreateCategoryModal, setIsCreateCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const { foodDetailModel } = useModelState();
  const [name, setName] = useState(foodDetailModel.name);
  const [description, setDescription] = useState(foodDetailModel.description);
  const [price, setPrice] = useState(foodDetailModel.price);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isContainerManagementModal, setIsContainerManagementModal] =
    useState(false);
  const [isRearrangeOptionGroupsInFood, setIsRearrangeOptionGroupsInFood] =
    useState(false);
  const [selectedShopCategory, setSelectedShopCategory] = useState(
    foodDetailModel.shopCategoryId
  );

  const [selectedPlatformCategory, setSelectedPlatformCategory] = useState(
    foodDetailModel.platformCategoryId
  );
  const [selectedPackingUnitId, setSelectedPackingUnitId] = useState(
    foodDetailModel.foodPackingUnit.id
  );
  const [selectedOptionGroups, setSelectedOptionGroups] = useState<string[]>(
    (foodDetailModel.optionGroups || [])?.map((item) =>
      item.optionGroupId.toString()
    )
  );
  const [selectedOperatingSlots, setSelectedOperatingSlots] = useState<
    string[]
  >(foodDetailModel.operatingSlots.map((item) => item.id.toString()));

  const [status, setStatus] = useState(foodDetailModel.status);
  const [isSoldOut, setIsSoldOut] = useState(foodDetailModel.isSoldOut);
  const [imageURI, setImageURI] = useState(foodDetailModel.imageUrl);

  useEffect(() => {
    setName(foodDetailModel.name);
    setDescription(foodDetailModel.description);
    setPrice(foodDetailModel.price);
    setSelectedShopCategory(foodDetailModel.shopCategoryId);
    setSelectedPlatformCategory(foodDetailModel.platformCategoryId);
    setSelectedPackingUnitId(foodDetailModel.foodPackingUnit.id);
    setSelectedOptionGroups(
      (foodDetailModel.optionGroups || [])?.map((item) =>
        item.optionGroupId.toString()
      )
    );
    setStatus(foodDetailModel.status);
    setIsSoldOut(foodDetailModel.isSoldOut);
    setSelectedOperatingSlots(
      foodDetailModel.operatingSlots.map((item) => item.id.toString())
    );
    setImageURI(foodDetailModel.imageUrl);
  }, [foodDetailModel]);

  useEffect(() => {
    formik.setFieldValue("shopCategoryId", Number(selectedShopCategory) || -1);
    console.log(formik.values);
  }, [selectedShopCategory]);
  useEffect(() => {
    formik.setFieldValue(
      "platformCategoryId",
      Number(selectedPlatformCategory) || -1
    );
    console.log(formik.values);
  }, [selectedPlatformCategory]);
  useEffect(() => {
    formik.setFieldValue(
      "foodPackingUnitId",
      Number(selectedPackingUnitId) || -1
    );
    console.log(formik.values);
  }, [selectedPackingUnitId]);

  const onStatusSwitch = () => {
    if (isSoldOut || status == 2) {
      setIsSoldOut(false);
      setStatus(1);
    } else {
      Alert.alert(
        `Xác nhận`,
        `Bạn muốn chuyển sang ẩn món hay tạm hết hàng hôm nay?`,
        [
          {
            text: "Tạm hết hàng hôm nay",
            onPress: async () => {
              setIsSoldOut(true);
              setStatus(1);
            },
          },
          {
            text: "Ẩn món này",
            onPress: async () => {
              setIsSoldOut(false);
              setStatus(2);
            },
          },
          {
            text: "Hủy",
          },
        ]
      );
    }
  };
  const {
    data: shopCategories,
    isLoading: isShopCategoriesLoading,
    error: shopCategoriesError,
    refetch: shopCategoriesRefetch,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_CATEGORY_LIST,
    (): Promise<ShopCategoryListResponse> =>
      apiClient
        .get(endpoints.SHOP_CATEGORY_LIST)
        .then((response) => response.data),
    []
  );
  const {
    data: platformCategories,
    isLoading: isPlatformCategoriesLoading,
    error: platformCategoriesError,
    refetch: platformCategoriesRefetch,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.PLATFORM_CATEGORY_LIST,
    (): Promise<PlatformCategoryListResponse> =>
      apiClient
        .get(endpoints.PLATFORM_CATEGORY_LIST)
        .then((response) => response.data),
    []
  );
  const foodPackingUnitFetcher = useFetchWithRQWithFetchFunc(
    [endpoints.FOOD_PACKING_UNIT_LIST],
    (): Promise<FetchResponse<FoodPackingUnit>> =>
      apiClient
        .get(endpoints.FOOD_PACKING_UNIT_LIST, {
          params: {
            pageIndex: 1,
            pageSize: 100_000_000,
          },
        })
        .then((response) => response.data),
    []
  );
  const {
    data: optionGroups,
    isLoading: isOptionGroupsLoading,
    error: optionGroupsError,
    refetch: optionGroupsRefetch,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.OPTION_GROUP_LIST,
    async (): Promise<FetchResponse<OptionGroupModel>> =>
      apiClient
        .get(endpoints.OPTION_GROUP_LIST, {
          headers: {
            Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            pageIndex: 1,
            pageSize: 100_000_000,
          },
        })
        .then((response) => response.data),
    []
  );
  const {
    data: operatingSlots,
    isLoading: isOperatingSlotsLoading,
    error: operatingSlotsError,
    refetch: operatingSlotsRefetch,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.OPERATING_SLOT_LIST,
    (): Promise<FetchOnlyListResponse<OperatingSlotModel>> =>
      apiClient
        .get(endpoints.OPERATING_SLOT_LIST)
        .then((response) => response.data),
    []
  );

  useFocusEffect(
    useCallback(() => {
      shopCategoriesRefetch();
      platformCategoriesRefetch();
      operatingSlotsRefetch();
      optionGroupsRefetch();
      foodPackingUnitFetcher.refetch();

      return () => {
        setIsRearrangeOptionGroupsInFood(false);
      };
    }, [])
  );
  // console.log(
  //   "fsdfsf",
  //   foodDetailModel.operatingSlots,
  //   selectedOperatingSlots,
  //   operatingSlots?.value?.map((item: OperatingSlotModel) => ({
  //     key: item.id.toString(),
  //     value: item.frameFormat,
  //   })) || []
  // );
  // console.log(
  //   "optionGroups",
  //   optionGroups?.value.items.map((item) => item.id + " " + item.title)
  // );
  const formik = useFormik({
    initialValues: {
      name: foodDetailModel.name,
      description: foodDetailModel.description,
      price: foodDetailModel.price,
      platformCategoryId: foodDetailModel.platformCategoryId,
      shopCategoryId: foodDetailModel.shopCategoryId,
      foodPackingUnitId: foodDetailModel.foodPackingUnit.id,
    },
    validationSchema,
    onSubmit: async (values) => {
      let toReturn = false;
      const submit = async () => {
        setIsSubmiting(true);
        try {
          let imageUrl = "";
          if (imageURI != foodDetailModel.imageUrl)
            imageUrl =
              (await imageService.uploadPreviewImage(imageURI)) ||
              CONSTANTS.url.noImageAvailable;
          else imageUrl = foodDetailModel.imageUrl;
          setImageURI(imageUrl);
          // Construct the data object to send to the API
          const foodData = {
            ...foodDetailModel,
            ...values,
            imgUrl: imageUrl,
            status: status,
            isSoldOut: isSoldOut,
            price: Number(values.price),
            foodOptionGroups: selectedOptionGroups.map((item) =>
              Number(item)
            ) as number[],
            operatingSlots: selectedOperatingSlots.map((item) =>
              Number(item)
            ) as number[],
          };
          console.log("FOOD DATA UPDATE: ", foodData);
          // Send POST request to the API
          const response = await apiClient.put(
            "shop-owner/food/update",
            foodData
          );
          console.log("RESPONSE : ", response);

          // Handle successful response
          Alert.alert("Hoàn tất", "Món đã được cập nhật!");
          // router.push("/menu");
        } catch (error: any) {
          Alert.alert(
            "Xảy ra lỗi khi cập nhật món",
            error?.response?.data?.error?.message || "Vui lòng thử lại!"
          );
        } finally {
          setIsSubmiting(false);
        }
      };
      if (selectedOperatingSlots.length === 0 && status == 1) {
        Alert.alert(
          "Vui lòng chọn khung giờ",
          "Để mở bán, bạn cần chọn ít nhất 1 khung giờ cho món",
          [
            {
              text: "Đã hiểu",
              onPress: () => {
                toReturn = true;
                return;
              },
              style: "cancel",
            },
            {
              text: "Tạm tắt món",
              onPress: () => {
                setStatus(2);
                setIsSoldOut(false);
                toReturn = false;
                // submit();
              },
            },
          ],
          { cancelable: false }
        );
        return;
      }
      submit();
    },
  });

  const getOptionGroup = (id: number) => {
    return (
      optionGroups?.value?.items.find((item) => item.id == id) || undefined
    );
  };
  const sortedOptionGroupItems = [...(optionGroups?.value?.items || [])].sort(
    (a, b) => {
      const aIndex = selectedOptionGroups.indexOf(a.id.toString());
      const bIndex = selectedOptionGroups.indexOf(b.id.toString());

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      if (aIndex !== -1) {
        return -1;
      }
      if (bIndex !== -1) {
        return 1;
      }
      return 0;
    }
  );

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Nhập liệu", "Vui lòng nhập tên danh mục");
      return;
    }

    const data = {
      name: categoryName,
      description: "",
      imageUrl: null,
    };

    try {
      setIsSubmiting(true);
      const response = await apiClient.post("shop-owner/category/create", data);
      const { value, isSuccess, error } = response.data;

      if (isSuccess) {
        toast.show(`Danh mục "${value.name}" đã được thêm!`, {
          type: "success",
          duration: 1500,
        });
        setIsCreateCategoryModal(false);
        shopCategoriesRefetch();
      } else {
        Alert.alert(
          "Thông báo",
          error.message || "Có lỗi xảy ra khi thêm danh mục!"
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Oops",
        error?.response?.data?.error?.message ||
          "Hệ thống đang bảo trì, vui lòng thử lại sau."
      );
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <>
      <PageLayoutWrapper>
        <View className="p-4 bg-white">
          <View className="items-start">
            <Text className="text-lg font-semibold">Ảnh mô tả</Text>
            <PreviewImageUpload
              isAutoShadow={true}
              imageWrapperStyle={{
                width: 90,
              }}
              aspect={[1, 1]}
              uri={imageURI}
              setUri={(uri: string) => {
                setImageURI(uri);
                // console.log("uri: ", uri);
              }}
            />
            {/* <ImageUpload
            containerStyleClasses="mt-2"
            uri={imageURI}
            setUri={(uri: string) => {
              setImageURI(uri);
            }}
            imageStyleObject={{ height: 90, width: 90 }}
            updateButton={
              <CustomButton
                title="Lưu"
                containerStyleClasses="bg-white  bg-[#227B94] h-8"
                textStyleClasses="text-sm text-white"
                handlePress={() => {}}
              />
            }
          /> */}
            <Text className="italic text-gray-700 mt-2 text-[12.8px]">
              Tối đa 5MB, nhận diện tệp .PNG, .JPG, .HEIC
            </Text>
          </View>
          <View className="border-b-2 border-gray-200 my-2" />
          <View className="">
            <FormField
              title="Tên món"
              otherInputStyleClasses="h-12"
              otherTextInputStyleClasses="text-sm"
              isRequired={true}
              placeholder="Nhập tên món..."
              value={formik.values.name}
              handleChangeText={(e) => {
                formik.setFieldValue("name", e);
              }}
            />
            {(formik.touched.name && formik.errors.name
              ? formik.errors.name
              : "") && (
              <Text className="text-red-500 mt-2 text-left w-full italic">
                {formik.touched.name && formik.errors.name
                  ? formik.errors.name
                  : ""}
              </Text>
            )}
            <FormField
              title="Mô tả"
              multiline={true}
              numberOfLines={2}
              otherStyleClasses="mt-5"
              otherInputStyleClasses="h-19 items-start"
              otherTextInputStyleClasses="p-1 text-sm font-medium h-17 mt-2"
              // isRequired={true}
              placeholder="Nhập mô tả món..."
              value={formik.values.description}
              handleChangeText={(e) => {
                formik.setFieldValue("description", e);
              }}
            />
            <FormField
              title="Giá"
              otherStyleClasses="mt-5"
              otherInputStyleClasses="h-12 justify-start"
              otherTextInputStyleClasses="text-sm"
              isRequired={true}
              placeholder="0"
              value={formatPrice(formik.values.price)}
              handleChangeText={(e) => {
                formik.setFieldValue("price", parseFormattedNumber(e));
              }}
              keyboardType="numeric"
              iconRight={<Text>₫</Text>}
            />
            {(formik.touched.price && formik.errors.price
              ? formik.errors.price
              : "") && (
              <Text className="text-red-500 mt-2 text-left w-full italic">
                {formik.touched.price && formik.errors.price
                  ? formik.errors.price
                  : ""}
              </Text>
            )}
            <View>
              <FormField
                title="Danh mục trong cửa hàng"
                otherStyleClasses="mt-5"
                otherInputStyleClasses="h-12"
                otherTextInputStyleClasses="text-sm"
                isRequired={true}
                placeholder="0"
                value={""}
                handleChangeText={() => {}}
                keyboardType="numeric"
                labelOnly={true}
              />
              <SelectList
                defaultOption={(
                  shopCategories?.value?.map((cat: ShopCategoryModel) => ({
                    key: cat.id.toString(),
                    value: cat.name,
                  })) || []
                ).find((item) => item.key == selectedShopCategory.toString())}
                setSelected={setSelectedShopCategory}
                data={
                  shopCategories?.value?.map((cat: ShopCategoryModel) => ({
                    key: cat.id.toString(),
                    value: cat.name,
                  })) || []
                }
                save="key"
                notFoundText="Không tìm thấy"
                placeholder="Danh mục trong cửa hàng"
                searchPlaceholder="Tìm kiếm..."
              />
              {(formik.touched.shopCategoryId && formik.errors.shopCategoryId
                ? formik.errors.shopCategoryId
                : "") && (
                <Text className="text-red-500 mt-2 text-left w-full italic">
                  {formik.touched.shopCategoryId && formik.errors.shopCategoryId
                    ? formik.errors.shopCategoryId
                    : ""}
                </Text>
              )}
              <Text className="text-[12px] text-gray-600 italic mt-1 ml-1">
                Danh mục này được sử dụng để phân loại và chia nhóm sản phẩm
                trong cửa hàng của bạn. Bạn cũng có thể{" "}
                <Text
                  onPress={() => setIsCreateCategoryModal(true)}
                  className="text-[12.5px] text-white text-[#227B94] font-semibold"
                >
                  thêm mới danh mục trong cửa hàng
                </Text>
                .
              </Text>
            </View>

            <View>
              <FormField
                title="Danh mục trên hệ thống"
                otherStyleClasses="mt-5"
                otherInputStyleClasses="h-12"
                otherTextInputStyleClasses="text-sm"
                isRequired={true}
                placeholder="0"
                value={""}
                handleChangeText={() => {}}
                keyboardType="numeric"
                labelOnly={true}
              />
              <SelectList
                defaultOption={(
                  platformCategories?.value?.map(
                    (cat: PlatformCategoryModel) => ({
                      key: cat.id.toString(),
                      value: cat.name,
                    })
                  ) || []
                ).find(
                  (item) => item.key == selectedPlatformCategory.toString()
                )}
                setSelected={setSelectedPlatformCategory}
                data={
                  platformCategories?.value?.map(
                    (cat: PlatformCategoryModel) => ({
                      key: cat.id.toString(),
                      value: cat.name,
                    })
                  ) || []
                }
                save="key"
                placeholder="Danh mục trên hệ thống"
                searchPlaceholder="Tìm kiếm..."
              />
              {(formik.touched.platformCategoryId &&
              formik.errors.platformCategoryId
                ? formik.errors.platformCategoryId
                : "") && (
                <Text className="text-red-500 mt-2 text-left w-full italic">
                  {formik.touched.platformCategoryId &&
                  formik.errors.platformCategoryId
                    ? formik.errors.platformCategoryId
                    : ""}
                </Text>
              )}
              <Text className="text-[12px] text-gray-600 italic mt-1 ml-1">
                Danh mục này được sử dụng để phân loại và hỗ trợ tìm kiếm dễ
                dàng trên hệ thống.
              </Text>
            </View>

            <View>
              <FormField
                title="Khối lượng quy đổi"
                otherStyleClasses="mt-5"
                otherInputStyleClasses="h-12"
                otherTextInputStyleClasses="text-sm"
                isRequired={true}
                placeholder="0"
                value={""}
                handleChangeText={() => {}}
                keyboardType="numeric"
                labelOnly={true}
              />
              <SelectList
                defaultOption={(
                  foodPackingUnitFetcher.data?.value.items.map((unit) => ({
                    key: unit.id.toString(),
                    value: unit.name + " ~ " + unit.weight + "kg",
                  })) || []
                ).find((item) => item.key == selectedPackingUnitId.toString())}
                setSelected={setSelectedPackingUnitId}
                data={
                  foodPackingUnitFetcher.data?.value.items.map((unit) => ({
                    key: unit.id.toString(),
                    value:
                      unit.name +
                      " ~ " +
                      unit.weight +
                      "kg" +
                      (unit.type == 2 ? " (bạn đã tạo)" : ""),
                  })) || []
                }
                save="key"
                placeholder="Khối lượng quy đổi"
                searchPlaceholder="Tìm kiếm..."
              />
              {(formik.touched.foodPackingUnitId &&
              formik.errors.foodPackingUnitId
                ? formik.errors.foodPackingUnitId
                : "") && (
                <Text className="text-red-500 mt-2 text-left w-full italic">
                  {formik.touched.foodPackingUnitId &&
                  formik.errors.foodPackingUnitId
                    ? formik.errors.foodPackingUnitId
                    : ""}
                </Text>
              )}
              <Text className="text-[12px] text-gray-600 italic mt-1 ml-1">
                Khối lượng này là khối lượng của sản phẩm và vật đựng tương ứng
                (trường hợp vật đựng có khối lượng đáng kể).
              </Text>
              <TouchableOpacity
                onPress={() => setIsContainerManagementModal(true)}
                className="w-full mt-1 bg-[#227B94] border-[#227B94] border-0 rounded-md items-start justify-center px-[6px] bg-white "
              >
                <Text className="text-[12.5px] text-white text-[#227B94] font-semibold">
                  Quản lí vật đựng và khối lượng quy đổi
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <FormField
                title="Liên kết nhóm lựa chọn phụ"
                otherStyleClasses="mt-5"
                otherInputStyleClasses="h-12"
                otherTextInputStyleClasses="text-sm"
                placeholder="0"
                value={""}
                handleChangeText={() => {}}
                keyboardType="numeric"
                labelOnly={true}
              />
              <Text className="text-[12px] text-gray-600 italic mt-1 ml-1 mb-2">
                Ví dụ: topping, kích cỡ, lượng đá,...
              </Text>
              <CustomMultipleSelectList
                selectedText="Liên kết đã chọn"
                selected={selectedOptionGroups}
                defaultOptions={
                  (
                    optionGroups?.value?.items?.map(
                      (group: OptionGroupModel) => ({
                        key: group.id.toString(),
                        value: group.title,
                      })
                    ) || []
                  ).filter((item) =>
                    selectedOptionGroups.some(
                      (value) => value.toString() === item.key
                    )
                  ) as { key: any; value: any }[]
                }
                setSelected={setSelectedOptionGroups}
                data={
                  sortedOptionGroupItems?.map((group: OptionGroupModel) => ({
                    key: group.id.toString(),
                    value: group.title,
                  })) || []
                }
                save="key"
                placeholder="Liên kết các nhóm lựa chọn"
                onSelect={() => {}}
                searchPlaceholder="Tìm kiếm nhóm"
                label="Các nhóm đã liên kết"
                notFoundText={
                  optionGroups?.value?.items?.length == 0
                    ? "Chưa có nhóm lựa chọn nào, bạn vẫn thể tạo và cập nhật sau khi tạo món mới"
                    : "Không tìm thấy"
                }
                dropdownShown={false}
                closeicon={
                  <Ionicons name="checkmark-outline" size={22} color="gray" />
                }
              />
              <TouchableOpacity
                onPress={() => setIsRearrangeOptionGroupsInFood(true)}
                className="w-full mt-1 bg-[#227B94] border-[#227B94] border-0 rounded-md items-start justify-center px-[6px] bg-white "
              >
                <Text className="text-[12.5px] text-white text-[#227B94] font-semibold">
                  Sắp xếp thứ tự các nhóm đã chọn
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <FormField
                title="Khung thời gian phục vụ"
                otherStyleClasses="mt-5"
                otherInputStyleClasses="h-12"
                otherTextInputStyleClasses="text-sm"
                // isRequired={true}
                placeholder="0"
                value={""}
                handleChangeText={() => {}}
                keyboardType="numeric"
                labelOnly={true}
              />
              <Text className="text-[12px] text-gray-600 italic mt-1 ml-1 mb-2">
                Chọn theo các khoảng thời gian hoạt động của cửa hàng
              </Text>
              {selectedOperatingSlots && (
                <CustomMultipleSelectList
                  selected={selectedOperatingSlots}
                  defaultOptions={(
                    operatingSlots?.value?.map((item: OperatingSlotModel) => ({
                      key: item.id.toString(),
                      value: item.frameFormat,
                    })) || []
                  ).filter((item) =>
                    selectedOperatingSlots.some(
                      (slotId) => slotId.toString() == item.key
                    )
                  )}
                  selectedText="Khoảng đã chọn"
                  setSelected={setSelectedOperatingSlots}
                  data={
                    operatingSlots?.value?.map((item: OperatingSlotModel) => ({
                      key: item.id.toString(),
                      value: item.frameFormat,
                    })) || []
                  }
                  save="key"
                  placeholder="Lựa chọn khoảng thời gian phục vụ"
                  onSelect={() => {}}
                  search={false}
                  label="Các khoảng thời gian đã chọn"
                  dropdownShown={false}
                  closeicon={
                    <Ionicons name="checkmark-outline" size={22} color="gray" />
                  }
                />
              )}
            </View>
            <View className="flex-row items-center justify-start mt-2">
              <FormField
                title={
                  isSoldOut
                    ? "Tạm hết hàng"
                    : status == 1
                    ? "Đang mở bán"
                    : "Đã tạm ẩn"
                }
                otherStyleClasses="w-[142px]"
                otherInputStyleClasses="h-12"
                otherTextInputStyleClasses="text-sm"
                // isRequired={true}
                placeholder="0"
                value={""}
                labelOnly={true}
                handleChangeText={() => {}}
                keyboardType="numeric"
              />
              <Switch
                color="#e95137"
                value={!isSoldOut && status == 1}
                onValueChange={onStatusSwitch}
              />
            </View>
          </View>
          <CustomButton
            title="Hoàn tất"
            isLoading={isSubmiting}
            containerStyleClasses="mt-5 bg-primary"
            textStyleClasses="text-white"
            handlePress={formik.handleSubmit}
          />
          <CustomButton
            title="Xóa khỏi thực đơn"
            handlePress={async () => {
              Alert.alert("Xác nhận xóa", `Bạn có chắc xóa món này không?`, [
                {
                  text: "Hủy",
                  style: "cancel",
                },
                {
                  text: "Đồng ý",
                  onPress: async () => {
                    try {
                      const response = await apiClient.delete(
                        `shop-owner/food/${foodDetailModel.id}`,
                        {
                          data: {
                            id: foodDetailModel.id,
                            isConfirm: true,
                          },
                        }
                      );
                      Alert.alert(
                        "Hoàn tất",
                        `Đã xóa "${foodDetailModel.name}" khỏi thực đơn!`
                      );
                      router.replace("/menu");
                    } catch (error: any) {
                      if (error.response && error.response.status === 404) {
                        Alert.alert("Oops!", "Món không còn tồn tại!");
                        router.replace("/menu");
                      } else {
                        Alert.alert(
                          "Oops!",
                          error?.response?.data?.error?.message ||
                            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                        );
                      }
                    }
                  },
                },
              ]);
            }}
            containerStyleClasses={`mt-2 w-full h-[48px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-semibold z-10 border-secondary bg-white relative `}
            textStyleClasses={`text-[16px] text-gray-900 ml-1 text-secondary`}
          />
        </View>
      </PageLayoutWrapper>
      <Portal>
        <Modal
          visible={isRearrangeOptionGroupsInFood}
          onDismiss={() => setIsRearrangeOptionGroupsInFood(false)}
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View className="w-[80%] bg-white p-4 rounded-md">
            <Text className="text-center text-[12px] font-semibold">
              Sắp xếp thứ tự hiển thị {"\n"} các nhóm đã chọn trên sản phẩm này
            </Text>
            <View
              className="mt-3"
              style={
                {
                  // height: selectedOptionGroups.length * 120,
                }
              }
            >
              {!selectedOptionGroups.length && (
                <View className="h-20 w-full items-center justify-center">
                  <Text className="text-[13.2px] text-center italic gray-700">
                    Bạn chưa liên kết với nhóm lựa chọn nào
                  </Text>
                  <CustomButton
                    title="Thoát"
                    containerStyleClasses="mt-5 bg-white border-gray-300 border-[2px] h-8"
                    textStyleClasses="text-white text-[14px] text-gray-500 font-normal"
                    handlePress={() => {
                      setIsRearrangeOptionGroupsInFood(false);
                    }}
                  />
                </View>
              )}
              <DraggableFlatList
                scrollEnabled={true}
                activationDistance={10}
                style={{ width: "100%", flexGrow: 1 }}
                data={selectedOptionGroups}
                renderItem={({ item, drag }: RenderItemParams<string>) => {
                  return (
                    <View key={item}>
                      <TouchableOpacity
                        className="border-[1px] border-gray-200 flex-row justify-between items-center p-2 mb-2 rounded-lg"
                        onLongPress={drag}
                      >
                        <Text className="w-full text-center text-[#14b8a6] font-semibold">
                          {getOptionGroup(Number(item))?.title || "------"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
                keyExtractor={(item) => `option-group-${item}`}
                onDragEnd={({ data }) => {
                  setSelectedOptionGroups(data);
                }}
              />
              {selectedOptionGroups.length > 0 && (
                <CustomButton
                  title="Hoàn tất"
                  containerStyleClasses="mt-3 bg-secondary h-10"
                  textStyleClasses="text-white text-[14px]"
                  handlePress={() => {
                    setIsRearrangeOptionGroupsInFood(false);
                  }}
                />
              )}

              {/* {getSelectedOptionGroups().map((item) => (
            <View key={item.id}>
              <Text>{item.title}</Text>
            </View>
          ))} */}
            </View>
          </View>
        </Modal>
      </Portal>
      <CustomModal
        title=""
        hasHeader={false}
        isOpen={isContainerManagementModal}
        setIsOpen={(value) => {
          setIsContainerManagementModal(value);
        }}
        titleStyleClasses="text-center flex-1"
        containerStyleClasses="w-[96%]"
        onBackdropPress={() => {
          setIsContainerManagementModal(false);
        }}
      >
        <ShopContainerManagement
          exit={() => setIsContainerManagementModal(false)}
        />
      </CustomModal>
      <CustomModal
        title=""
        hasHeader={false}
        isOpen={isCreateCategoryModal}
        setIsOpen={(value) => {
          setIsCreateCategoryModal(value);
        }}
        titleStyleClasses="text-center flex-1"
        containerStyleClasses="w-[96%]"
        onBackdropPress={() => {
          setIsCreateCategoryModal(false);
        }}
      >
        <View>
          <View className="mb-2">
            <Text className="font-bold text-[12.8px]">Tên danh mục</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 mt-1 px-3 p-2 pb-3 rounded text-[15px]"
                value={categoryName}
                onChangeText={(text) => {
                  setCategoryName(text);
                }}
                placeholder="Nhập tên danh mục..."
                placeholderTextColor="#888"
              />
            </View>
          </View>
          <CustomButton
            isLoading={isSubmiting}
            title="Thêm mới"
            containerStyleClasses="mt-3 bg-secondary h-10"
            textStyleClasses="text-white text-[14px]"
            handlePress={() => {
              handleAddCategory();
            }}
          />
        </View>
      </CustomModal>
    </>
  );
};

export default FoodUpdate;
