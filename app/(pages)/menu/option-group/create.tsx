import { View, Text, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import FormField from "@/components/custom/FormFieldCustom";
import CustomButton from "@/components/custom/CustomButton";
import { router } from "expo-router";
import CustomCheckbox from "@/components/custom/CustomCheckbox";
import { Ionicons } from "@expo/vector-icons";
import { Switch } from "react-native-paper";

interface Option {
  title: string;
  price: number;
  isCalculatePrice: boolean;
  isDefault: boolean;
  imageUrl: string;
  error: OptionError;
}
interface OptionError {
  title: string;
  price: string;
}
interface FormError {
  title: string;
}
const formatPrice = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
};

const parseFormattedNumber = (formattedValue: string) => {
  return Number(formattedValue.replace(/\./g, ""));
};

const OptionGroupCreate: React.FC = () => {
  const [isAvailable, setIsSwitchOn] = React.useState(true);
  const [formError, setFormError] = React.useState({
    title: "",
  });
  const [options, setOptions] = useState<Option[]>([
    {
      title: "",
      price: 1000,
      isCalculatePrice: true,
      isDefault: true,
      imageUrl: "no-img",
      error: { title: "", price: "" },
    },
  ]);
  const [title, setTitle] = useState<string>("");
  const [isRequire, setIsRequire] = useState<boolean>(false);
  const [isMultiSelect, setIsMultiSelect] = useState<boolean>(false);
  const [minSelect, setMinSelect] = useState<number>(1);
  const [maxSelect, setMaxSelect] = useState<number>(1);
  const [minSelectText, setMinSelectText] = useState<string>("1");
  const [maxSelectText, setMaxSelectText] = useState<string>("1");
  const [isMinSelectBlurred, setIsMinSelectBlurred] = useState(true);
  const [isMaxSelectBlurred, setIsMaxSelectBlurred] = useState(true);
  const [isTrySubmitted, setIsTrySubmitted] = useState(0);

  useEffect(() => {}, [isMultiSelect, isRequire]);
  useEffect(() => {
    if (isTrySubmitted > 0) {
      const updatedOptions = options.map((item) => {
        if (item.title && (!item.isCalculatePrice || item.price >= 1000))
          return { ...item, error: { title: "", price: "" } };
        const updatedError = {
          title:
            "Vui lòng " +
            (!item.title ? "nhập tiêu đề " : "") +
            (!item.title && item.price <= 0 && item.isCalculatePrice
              ? "và "
              : "") +
            (item.price <= 1000 && item.isCalculatePrice
              ? "nhập giá tối thiểu 1.000đ"
              : ""),
          price: "",
        };
        return { ...item, error: updatedError };
      });
      setOptions(updatedOptions);
    }
  }, [isTrySubmitted]);
  useEffect(() => {
    if (!isMaxSelectBlurred || !isMinSelectBlurred) return;
    // console.log("isMaxSelectBlurred", isMaxSelectBlurred);
    if (!isMultiSelect) {
      setMinSelect(isRequire ? 1 : 0);
      setMaxSelect(1);
      setMinSelectText(minSelect + "");
      setMaxSelectText(maxSelect + "");
      return;
    }

    // else if (isRequire && minSelect < 1) {
    //   setMinSelect(isRequire ? 1 : 0);
    //   setMaxSelect(Math.max(1, maxSelect));
    //   setMinSelectText(minSelect + "");
    //   setMaxSelectText(maxSelect + "");
    //   return;
    // }

    if (isRequire && minSelect < 1) {
      Alert.alert(
        "Nhập liệu",
        "Nhóm lựa chọn bắt buộc cần tối thiểu 1 câu trả lời!"
      );
      setMinSelect(1);
    } else if (minSelect < 0) {
      setMinSelect(isRequire ? 1 : 0);
      setMinSelectText(minSelect + "");
    } else if (minSelect > options.length) {
      setMinSelect(options.length);
      Alert.alert(
        "Nhập liệu",
        `Vui lòng nhập chọn tối thiểu không quá ${options.length} số lựa chọn hiện có!`
      );
    } else if (minSelect > maxSelect) {
      setMaxSelect(minSelect);
    } else if (maxSelect < 1) {
      Alert.alert(
        "Nhập liệu",
        "Nhóm lựa chọn bắt buộc cần tối đa ít nhất 1 câu trả lời!"
      );
      setMaxSelect(1);
    } else if (maxSelect > options.length) {
      setMaxSelect(options.length);
      Alert.alert(
        "Nhập liệu",
        `Vui lòng nhập chọn tối đa không quá ${options.length} số lựa chọn hiện có!`
      );
    } else if (minSelect > maxSelect) {
      setMinSelect(maxSelect);
    }

    console.log("max: ", maxSelect);
    setMinSelectText(minSelect + "");
    setMaxSelectText(maxSelect + "");
  }, [
    isMultiSelect,
    isRequire,
    minSelect,
    maxSelect,
    options,
    isMinSelectBlurred,
    isMaxSelectBlurred,
  ]);

  const validateForm = () => {
    setIsTrySubmitted(1);
    if (!title) {
      Alert.alert("Lỗi nhập liệu", "Tiêu đề không được để trống.");
      return false;
    }

    if (
      !options.every(
        (option) =>
          option.title && (option.price > 0 || option.isCalculatePrice == false)
      )
    ) {
      Alert.alert(
        "Lỗi ",
        "Vui lòng nhập tiêu đề và giá hợp lệ cho các lựa chọn."
      );

      return false;
    }
    if (isRequire) {
      const min = minSelect;
      const max = maxSelect;
      if (isNaN(min) || isNaN(max) || min < 1 || max < min) {
        Alert.alert(
          "Lỗi",
          "Vui lòng nhập số chọn tối thiểu và tối đa hợp lệ (tối thiểu ≥ 1 và tối đa ≥ tối thiểu)."
        );
        return false;
      }
    }
    if (options.filter((item) => item.isDefault).length < minSelect) {
      Alert.alert(
        "Lựa chọn mặc định ",
        `Vui lòng chọn đủ tối thiểu ${minSelect} lựa chọn mặc định .`
      );

      return false;
    }
    if (options.filter((item) => item.isDefault).length > maxSelect) {
      Alert.alert(
        "Lựa chọn mặc định ",
        `Vui lòng chỉ chọn tối đa ${maxSelect} cho lựa chọn mặc định .`
      );

      return false;
    }
    return true;
  };

  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        title: "",
        price: 1000,
        isCalculatePrice: true,
        isDefault: false,
        imageUrl: "no-img",
        error: { title: "", price: "" },
      },
    ]);
  };
  const handleOptionChange = (
    index: number,
    field: keyof Option,
    value: string | number | boolean
  ) => {
    // if (isTrySubmitted > 0) setIsTrySubmitted(isTrySubmitted + 1);
    let updatedOptions = options.map((item, i) =>
      i === index
        ? {
            ...item,
            [field]:
              field == "price" ? (item.isCalculatePrice ? value : 0) : value,
          }
        : item
    );
    updatedOptions = updatedOptions.map((item, i) =>
      i === index
        ? {
            ...item,
            price: item.isCalculatePrice ? item.price : 0,
          }
        : item
    );
    setOptions(updatedOptions);
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const data = {
      title,
      options,
      isMultiSelect: isRequire,
      minSelect,
      maxSelect,
    };
    console.log("Submit data:", data);
    // router.replace("/menu/option-group/link");
  };

  return (
    <PageLayoutWrapper>
      <View className="flex-1 bg-white p-4">
        <View className="flex-1">
          <FormField
            title="Tiêu đề"
            otherInputStyleClasses="h-12"
            otherTextInputStyleClasses="text-sm"
            isRequired={true}
            placeholder="Nhập tiêu đề nhóm..."
            value={title}
            handleChangeText={setTitle}
          />
          <CustomCheckbox
            isChecked={isRequire}
            handlePress={() => setIsRequire(!isRequire)}
            label={
              <Text className="text-[16px]">Đây là nhóm lựa chọn bắt buộc</Text>
            }
            containerStyleClasses={""}
          />
          <View>
            {options.map((item, index) => (
              <View key={index}>
                <View className="flex-row w-full mt-4 items-center items-end">
                  <FormField
                    title={`Lựa chọn ${index + 1}`}
                    otherStyleClasses="flex-1"
                    otherInputStyleClasses="h-10"
                    otherTextInputStyleClasses="text-sm"
                    isRequired={true}
                    placeholder="Nhập lựa chọn..."
                    value={item.title}
                    handleChangeText={(text: string) =>
                      handleOptionChange(index, "title", text)
                    }
                  />
                  <FormField
                    title="Giá thêm"
                    otherStyleClasses="w-[160px] ml-2"
                    otherInputStyleClasses="h-10"
                    otherTextInputStyleClasses="text-sm"
                    isRequired={true}
                    placeholder=""
                    readOnly={!item.isCalculatePrice}
                    value={formatPrice(item.price)}
                    handleChangeText={(text: string) =>
                      handleOptionChange(
                        index,
                        "price",
                        parseFormattedNumber(text)
                      )
                    }
                    iconRight={
                      <View className="flex-row items-center mr-[-10px]">
                        <Text className="mb-1">₫</Text>
                        <Switch
                          color="#FF9C01"
                          value={item.isCalculatePrice}
                          onValueChange={() =>
                            handleOptionChange(
                              index,
                              "isCalculatePrice",
                              !item.isCalculatePrice
                            )
                          }
                        />
                      </View>
                    }
                  />
                </View>
                {item.error.title && (
                  <Text className="ml-2 text-red-500 mt-2 text-left w-full italic">
                    {item.error.title}
                  </Text>
                )}
                <View className="flex-row items-center justify-between">
                  <CustomCheckbox
                    isChecked={item.isDefault}
                    handlePress={() => {
                      handleOptionChange(index, "isDefault", !item.isDefault);
                    }}
                    label={
                      <Text className="text-[15px]">Lựa chọn mặc định</Text>
                    }
                    containerStyleClasses={"w-[220px]"}
                  />
                  <CustomButton
                    title="Xóa"
                    handlePress={() => handleRemoveOption(index)}
                    containerStyleClasses="h-10 bg-red-500 ml-2 px-2 bg-white border-2 border-red-400 box-border border-0"
                    textStyleClasses="text-white text-sm text-primary text-[14px]"
                  />
                </View>
              </View>
            ))}
          </View>

          <CustomButton
            title="Thêm lựa chọn"
            handlePress={handleAddOption}
            containerStyleClasses="h-10 bg-white border-2 border-gray-300 mt-2"
            textStyleClasses="text-sm text-secondary"
          />
          <View className="border-b-2 border-gray-200 mt-4" />
          <View className="mt-5">
            <CustomCheckbox
              isChecked={isMultiSelect}
              handlePress={() => setIsMultiSelect(!isMultiSelect)}
              label={<Text className="text-[16px]">Cho phép chọn nhiều</Text>}
              containerStyleClasses={"w-[240px]"}
            />
            <View className="flex-row mt-1">
              <FormField
                title="Chọn tối thiểu"
                otherStyleClasses="w-[150px] ml-2"
                otherInputStyleClasses="h-8"
                otherTextInputStyleClasses="text-sm text-center"
                isRequired={true}
                placeholder="0"
                readOnly={!isMultiSelect}
                value={minSelectText}
                handleChangeText={(e) => {
                  setMinSelect(Number(e));
                  setMinSelectText(e);
                }}
                onFocus={() => setIsMinSelectBlurred(false)}
                onBlur={() => setIsMinSelectBlurred(true)}
              />
              <FormField
                title="Chọn tối đa"
                otherStyleClasses="w-[150px] ml-4"
                otherInputStyleClasses="h-8"
                otherTextInputStyleClasses="text-sm text-center"
                isRequired={true}
                placeholder="0"
                value={maxSelectText}
                readOnly={!isMultiSelect}
                handleChangeText={(e) => {
                  setMaxSelect(Number(e));
                  setMaxSelectText(e);
                }}
                onFocus={() => setIsMaxSelectBlurred(false)}
                onBlur={() => setIsMaxSelectBlurred(true)}
              />
            </View>
          </View>
          <View className="border-b-2 border-gray-200 mt-3" />

          <View className="flex-row items-center justify-start ml-1 mt-4">
            <FormField
              title={isAvailable ? "Có sẵn" : "Tạm ẩn"}
              otherStyleClasses="w-[100px]"
              otherInputStyleClasses="h-12"
              otherTextInputStyleClasses="text-sm"
              placeholder="0"
              value=""
              labelOnly={true}
              handleChangeText={() => {}}
            />
            <Switch
              color="#e95137"
              value={isAvailable}
              onValueChange={setIsSwitchOn}
            />
          </View>
        </View>

        <CustomButton
          title="Hoàn tất"
          containerStyleClasses="mt-2 bg-primary"
          textStyleClasses="text-white"
          handlePress={handleSubmit}
        />
      </View>
    </PageLayoutWrapper>
  );
};

export default OptionGroupCreate;
