import { View, Text } from "react-native";
import React from "react";
import Avatar from "react-native-paper/lib/typescript/components/Avatar/AvatarIcon";
import AvatarChange from "@/components/common/AvatarChange";
import ImageUpload from "@/components/common/ImageUpload";
import CustomButton from "@/components/custom/CustomButton";
import FormField from "@/components/custom/FormFieldCustom";

const FoodCreate = () => {
  return (
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
              title="Cập nhật"
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
      </View>
    </View>
  );
};

export default FoodCreate;
