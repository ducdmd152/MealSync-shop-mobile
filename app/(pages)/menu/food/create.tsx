import { View, Text } from "react-native";
import React from "react";
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
import { router } from "expo-router";
const data = [
  { key: "1", value: "Mobiles", disabled: true },
  { key: "2", value: "Appliances" },
  { key: "3", value: "Cameras" },
  { key: "4", value: "Computers", disabled: true },
  { key: "5", value: "Vegetables" },
  { key: "6", value: "Diary Products" },
  { key: "7", value: "Drinks" },
];

const categories = [
  { key: "1", value: "Mobiles", disabled: true },
  { key: "2", value: "Appliances" },
  { key: "3", value: "Cameras" },
  { key: "4", value: "Computers", disabled: true },
  { key: "5", value: "Vegetables" },
  { key: "6", value: "Diary Products" },
  { key: "7", value: "Drinks" },
];

const FoodCreate = () => {
  const [select, setSelect] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  return (
    <PageLayoutWrapper>
      <View className="p-4 bg-white">
        <View className="items-start">
          <Text className="text-lg font-semibold">Ảnh mô tả</Text>
          <ImageUpload
            containerStyleClasses="mt-2"
            uri="https://reactnative.dev/img/tiny_logo.png"
            setUri={() => {}}
            imageStyleObject={{ height: 100, width: 90 }}
            updateButton={
              <CustomButton
                title="Lưu"
                containerStyleClasses="bg-white  bg-[#227B94] h-8"
                textStyleClasses="text-sm text-white"
                handlePress={() => {}}
              />
            }
          />
          <Text className="italic text-gray-700 mt-2">
            Tối đa 5MB, nhận diện tệp .PNG, .JPG
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
            value={""}
            handleChangeText={() => {}}
          />
          <FormField
            title="Mô tả"
            multiline={true}
            numberOfLines={2}
            otherStyleClasses="mt-5"
            otherInputStyleClasses="h-20 items-start"
            otherTextInputStyleClasses="text-sm h-17 mt-2"
            isRequired={true}
            placeholder="Nhập tên mô tả..."
            value={""}
            handleChangeText={() => {}}
          />
          <FormField
            title="Giá"
            otherStyleClasses="mt-5"
            otherInputStyleClasses="h-12"
            otherTextInputStyleClasses="text-sm"
            isRequired={true}
            placeholder="0"
            value={""}
            handleChangeText={() => {}}
            keyboardType="numeric"
          />
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
              setSelected={(val: string) => setSelect(val)}
              data={data}
              save="value"
              placeholder="Danh mục trong cửa hàng"
              searchPlaceholder="Tìm kiếm..."
            />
            <Text className="text-[12px] text-gray-600 italic mt-1 ml-1">
              Danh mục này được sử dụng để phân loại và chia nhóm sản phẩm trong
              cửa hàng của bạn.
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
              setSelected={(val: string) => setSelect(val)}
              data={data}
              save="value"
              placeholder="Danh mục trong cửa hàng"
              searchPlaceholder="Tìm kiếm..."
            />
            <Text className="text-[12px] text-gray-600 italic mt-1 ml-1">
              Danh mục này được sử dụng để phân loại và hỗ trợ tìm kiếm dễ dàng
              trên hệ thống.
            </Text>
          </View>

          <View>
            <FormField
              title="Liên kết nhóm lựa chọn phụ"
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
            <Text className="text-[12px] text-gray-600 italic mt-1 ml-1 mb-2">
              Ví dụ: topping, kích cỡ, lượng đá,...
            </Text>
            <MultipleSelectList
              setSelected={(val: string[]) => setSelected(val)}
              data={data}
              save="value"
              placeholder="Liên kết các nhóm lựa chọn"
              onSelect={() => {}}
              searchPlaceholder="Tìm kiếm nhóm"
              label="Các nhóm đã liên kết"
              notFoundText="Không tìm thấy"
              dropdownShown={false}
              closeicon={
                <Ionicons name="checkmark-outline" size={22} color="gray" />
              }
            />
          </View>
        </View>
        <CustomButton
          title="Hoàn tất"
          containerStyleClasses="mt-2 bg-primary"
          textStyleClasses="text-white"
          handlePress={() => {
            router.push("/menu");
          }}
        />
      </View>
    </PageLayoutWrapper>
  );
};

export default FoodCreate;
