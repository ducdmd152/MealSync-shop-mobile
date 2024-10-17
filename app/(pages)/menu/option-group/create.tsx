import { View, Text } from "react-native";
import React, { useState } from "react";
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
  const onToggleSwitch = () => setIsSwitchOn(!isAvailable);
  const [options, setOptions] = useState<Option[]>([
    {
      title: "",
      price: 0,
      isCalculatePrice: true,
      isDefault: true,
      imageUrl: "no-img",
    },
  ]);
  const [title, setTitle] = useState<string>("");
  const [isMultiSelect, setIsMultiSelect] = useState<boolean>(false);
  const [minSelect, setMinSelect] = useState<string>("1");
  const [maxSelect, setMaxSelect] = useState<string>("1");

  const handleAddOption = () => {
    setOptions([...options, { title: "", price: "0" }]);
  };

  const handleOptionChange = (
    index: number,
    field: keyof Option,
    value: string | number | boolean
  ) => {
    const updatedOptions = options.map((item, i) =>
      i === index
        ? {
            ...item,
            [field]: value,
            price: item.price * Number(item.isCalculatePrice),
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
    const data = {
      title,
      options,
      isMultiSelect,
      minSelect,
      maxSelect,
    };
    // Gửi `data` về server ở đây
    console.log("Submit data:", data);
    router.replace("/menu/option-group/link");
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

          <View>
            {options.map((item, index) => (
              <View className="">
                <View
                  key={index}
                  className="flex-row w-full mt-4 items-center items-end"
                >
                  <FormField
                    title={`Lựa chọn ${index + 1}`}
                    otherStyleClasses="flex-1"
                    otherInputStyleClasses="h-10"
                    otherTextInputStyleClasses="text-sm"
                    isRequired={true}
                    placeholder="Nhập lựa chọn..."
                    value={item.title}
                    handleChangeText={(text: string) =>
                      handleOptionChange(index, "option", text)
                    }
                  />
                  <FormField
                    title="Giá thêm"
                    otherStyleClasses="w-[160px] ml-2"
                    otherInputStyleClasses="h-10"
                    otherTextInputStyleClasses="text-sm"
                    isRequired={true}
                    placeholder=""
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
                <View className="flex-row items-center justify-between">
                  <CustomCheckbox
                    isChecked={item.isDefault}
                    handlePress={() => {
                      handleOptionChange(index, "isDefault", !item.isDefault);
                    }}
                    label={
                      <Text className="text-[16px]">Lựa chọn mặc định</Text>
                    }
                    containerStyleClasses={"w-[220px]"}
                  />
                  <CustomButton
                    title="Xóa"
                    //   iconLeft={
                    //     <Ionicons name="close-outline" size={22} color="#ef4444" />
                    //   }
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
                placeholder=""
                readOnly={!isMultiSelect}
                value={minSelect}
                handleChangeText={setMinSelect}
              />
              <FormField
                title="Chọn tối đa"
                otherStyleClasses="w-[150px] ml-4"
                otherInputStyleClasses="h-8"
                otherTextInputStyleClasses="text-sm text-center"
                isRequired={true}
                placeholder=""
                value={maxSelect}
                readOnly={!isMultiSelect}
                handleChangeText={setMaxSelect}
              />
            </View>
          </View>
          <View className="border-b-2 border-gray-200 mt-3" />

          <View className="flex-row items-center justify-start ml-1 mt-4">
            <FormField
              title={isAvailable ? "Mở bán ngay" : "Tạm ẩn nhóm"}
              otherStyleClasses="w-[150px]"
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
              value={isAvailable}
              onValueChange={onToggleSwitch}
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
