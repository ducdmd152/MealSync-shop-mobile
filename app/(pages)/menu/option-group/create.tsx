import { View, Text } from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import FormField from "@/components/custom/FormFieldCustom";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import CustomCheckbox from "@/components/custom/CustomCheckbox";

const OptionGroupCreate = () => {
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
            value={""}
            handleChangeText={() => {}}
          />
          <View className="flex-row w-full mt-4">
            <FormField
              title="Danh sách lựa chọn"
              otherStyleClasses="flex-1"
              otherInputStyleClasses="h-10"
              otherTextInputStyleClasses="text-sm"
              isRequired={true}
              placeholder="Nhập lựa chọn..."
              value={""}
              handleChangeText={() => {}}
            />
            <FormField
              title="Giá thêm"
              otherStyleClasses="w-[120px] ml-2"
              otherInputStyleClasses="h-10"
              otherTextInputStyleClasses="text-sm"
              isRequired={true}
              placeholder=""
              value={"0"}
              handleChangeText={() => {}}
            />
          </View>
          <CustomButton
            title="Thêm lựa chọn"
            handlePress={() => {}}
            containerStyleClasses="h-10 bg-white border-2 border-gray-300 mt-2"
            textStyleClasses="text-sm text-secondary"
            //   iconLeft={
            //     <View className="mr-1">
            //       <Ionicons name="add-circle-outline" size={22} color="#FF9C01" />
            //     </View>
            //   }
          />

          <View className="mt-3">
            <CustomCheckbox
              isChecked={true}
              handlePress={() => {}}
              label={<Text className="text-[16px]">Cho phép chọn nhiều</Text>}
              containerStyleClasses={"w-[200px]"}
            />
            <View className="flex-row ">
              <FormField
                title="Chọn tối thiểu"
                otherStyleClasses="w-[120px] ml-2"
                otherInputStyleClasses="h-8"
                otherTextInputStyleClasses="text-sm text-center"
                isRequired={true}
                placeholder=""
                value={"1"}
                handleChangeText={() => {}}
              />
              <FormField
                title="Chọn tối đa"
                otherStyleClasses="w-[120px] ml-4"
                otherInputStyleClasses="h-8"
                otherTextInputStyleClasses="text-sm text-center"
                isRequired={true}
                placeholder=""
                value={"1"}
                handleChangeText={() => {}}
              />
            </View>
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

export default OptionGroupCreate;
