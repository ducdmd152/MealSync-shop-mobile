import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native-elements";
import { Searchbar, TouchableRipple } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import DateTimePicker from "react-native-ui-datepicker";

const STATUSES = [
  { label: "Tất cả", value: "0" },
  { label: "Khả dụng", value: "1" },
  { label: "Đã tắt", value: "2" },
];

const Promotion = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("0");
  const [fromDate, setFromDate] = useState(dayjs(dayjs("2024-01-01")));
  const [toDate, setToDate] = useState(dayjs(Date.now()));
  const [isFromDatePickerVisible, setFromDatePickerVisibility] =
    useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);

  const toggleFromDatePicker = () => {
    setFromDatePickerVisibility(!isFromDatePickerVisible);
  };
  const toggleToDatePicker = () => {
    setToDatePickerVisibility(!isToDatePickerVisible);
  };

  return (
    <PageLayoutWrapper isScroll={false}>
      <CustomButton
        title="Thêm mới"
        handlePress={() => {}}
        containerStyleClasses="h-[48px] px-4 bg-transparent border-0 border-gray-200 absolute bottom-8 right-5 bg-primary font-psemibold z-10"
        iconLeft={
          <Ionicons name="add-circle-outline" size={21} color="white" />
        }
        textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
      />
      <View className="w-full flex-1 bg-white text-black p-4 pb-0 relative">
        <View className="flex-1 gap-2 z-0">
          <View className="w-full">
            <Searchbar
              style={{
                height: 50,
              }}
              inputStyle={{ minHeight: 0 }}
              placeholder="Nhập tiêu đề khuyến mãi..."
              onChangeText={setSearchQuery}
              value={searchQuery}
            />
          </View>

          <ScrollView
            style={{ width: "100%", flexShrink: 0 }}
            horizontal={true}
          >
            <View className="w-full flex-row gap-2 items-center justify-between pb-2">
              <Text className=" bg-gray-100 rounded-xl px-4 py-2 bg-secondary text-center">
                Tất cả
              </Text>
              <Text className=" bg-gray-100 rounded-xl px-4 py-2 text-center">
                Khả dụng
              </Text>
              <Text className="bg-gray-100 rounded-xl px-4 py-2 text-center">
                Hết hạn
              </Text>
              <Text className=" bg-gray-100 rounded-xl px-4 py-2 text-center">
                Đã tắt
              </Text>
            </View>
          </ScrollView>

          {/* TIME FILTERING */}
          <View className="flex-row justify-between mb-1">
            {/* Date:To */}
            <View className="flex-col flex-1 px-1 relative">
              <Text className="text-gray-500  text-sm absolute top-[-8px] bg-white z-10 left-5">
                Khoảng từ
              </Text>
              <TouchableRipple
                onPress={toggleFromDatePicker}
                className="border-2 border-gray-300 p-2 rounded-md"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-black mx-2 text-lg">
                    {fromDate.format("DD/MM/YYYY")}
                  </Text>
                  <Ionicons name="create-outline" size={21} color="gray-600" />
                </View>
              </TouchableRipple>
            </View>

            {/* Date:To */}
            <View className="flex-col flex-1 px-1 relative">
              <Text className="text-gray-500  text-sm absolute top-[-8px] bg-white z-10 left-5">
                Đến hết
              </Text>
              <TouchableRipple
                onPress={toggleToDatePicker}
                className="border-2 border-gray-300 p-2 rounded-md"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-black mx-2 text-lg">
                    {toDate.format("DD/MM/YYYY")}
                  </Text>
                  <Ionicons name="create-outline" size={21} color="gray-600" />
                </View>
              </TouchableRipple>
            </View>
            {/* From Date Picker Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={isFromDatePickerVisible}
              onRequestClose={() => setFromDatePickerVisibility(false)}
            >
              <BlurView intensity={50} style={styleTimePicker.modalBackground}>
                <View style={styleTimePicker.modalContent}>
                  <DateTimePicker
                    minDate={dayjs("2024-01-01").toDate()}
                    maxDate={toDate.toDate()}
                    mode="single"
                    startDate={fromDate.toDate()}
                    endDate={toDate.toDate()}
                    locale="vi-VN"
                    date={fromDate.toDate()}
                    onChange={(params) => {
                      setFromDate(dayjs(params.date));
                      setFromDatePickerVisibility(false);
                    }}
                  />
                </View>
              </BlurView>
            </Modal>

            {/* To Date Picker Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={isToDatePickerVisible}
              onRequestClose={() => setToDatePickerVisibility(false)}
            >
              <BlurView intensity={50} style={styleTimePicker.modalBackground}>
                <View style={styleTimePicker.modalContent}>
                  <DateTimePicker
                    minDate={fromDate.toDate()}
                    maxDate={dayjs("2030-01-01").toDate()}
                    mode="single"
                    startDate={fromDate.toDate()}
                    endDate={toDate.toDate()}
                    locale="vi-VN"
                    date={toDate.toDate()}
                    onChange={(params) => {
                      setToDate(dayjs(params.date));
                      setToDatePickerVisibility(false);
                    }}
                  />
                </View>
              </BlurView>
            </Modal>
          </View>
          <ScrollView style={{ width: "100%", flexGrow: 1 }}>
            <View className="gap-y-2 pb-[154px]">
              {Array.from({ length: 10 }, (_, i) => (
                <View
                  key={i}
                  className="p-4 pt-3 bg-white drop-shadow-md rounded-lg shadow"
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-row flex-1 justify-start items-start gap-x-2">
                      <View className="self-stretch">
                        <Image
                          source={{
                            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdcArSQUEt5D7oqzkUhMpP-PIQK6g6BtbFow&s",
                          }}
                          resizeMode="cover"
                          className="h-[52px] w-[62px] rounded-md opacity-85"
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-[12.5px] font-psemibold mt-[-2px]"
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          Khuyến mãi 5k đơn hàng trên 40k
                        </Text>
                        <Text className="text-[12px] italic text-gray-500 mt-[-2px]">
                          12/10/2024 - 20/10/2024
                        </Text>
                      </View>
                    </View>
                    <Text className="bg-blue-100 text-blue-800 text-[12px] font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      Status
                    </Text>
                  </View>
                  <View className="flex-row justify-end gap-2 pt-4">
                    <TouchableOpacity
                      onPress={() => {}}
                      className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                    >
                      <Text className="text-[13.5px] text-white">
                        Chỉnh sửa
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {}}
                      className="bg-white border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                    >
                      <Text className="text-[13.5px]">Chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

const styleTimePicker = StyleSheet.create({
  drawerText: {
    color: "white",
    backgroundColor: "#DF4830",
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  datePickerButton: {
    backgroundColor: "#065b1a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  datePickerText: {
    color: "white",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

export default Promotion;
