import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/already-components/ThemedText";
import CustomButton from "@/components/custom/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "react-native-paper";

export default function HomeScreen() {
  return (
    <View className="w-full h-full flex-1 items-center justify-start bg-white p-2">
      <View className="w-full h-[86px] flex-row items-center justify-between p-2 gap-x-2">
        <View className="flex-1 items-start">
          <Text className="text-lg text-gray-600">Cửa hàng</Text>
          <Text className="flex-1 text-[28px] text-gray text-primary font-pmedium">
            Tiệm ăn tháng năm
          </Text>
        </View>
        <View className="py-1 mt-1">
          <View className="w-[52px] justify-center items-center border-[0.4px] border-gray-100 rounded-full p-1">
            <Avatar.Image
              size={44}
              source={{
                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV5-FEuyxb-HMUB41PwAEX_yopAjz0KgMAbg&s",
              }}
            />
          </View>
        </View>
      </View>
      <ScrollView style={{ width: "100%", flexGrow: 1 }}>
        <View className="w-full items-start p-2">
          <View className="w-full flex-row justify-between items-center mb-3">
            <Text className="text-lg text-gray-600">Đơn hàng hôm nay</Text>
            <Link href="/order" className="text-primary opacity-85 italic">
              {"Xem đơn hàng >>>"}
            </Link>
          </View>
          <View className="w-full flex-row gap-2 items-between">
            <TouchableOpacity className="flex-1 h-[80px] bg-gray-000  border-2 border-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold text-xl text-secondary-100">
                10
              </Text>
              <Text className="text-secondary-200">chờ xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-[80px] bg-gray-000  border-2 border-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold text-xl">10</Text>
              <Text>đã xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-[80px] bg-gray-000  border-2 border-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold text-xl">10</Text>
              <Text>đang chuẩn bị</Text>
            </TouchableOpacity>
          </View>
          <View className="w-full flex-row gap-2 items-between mt-2">
            <TouchableOpacity className="flex-1 h-[80px] bg-gray-000 border-2 border-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold text-xl">10</Text>
              <Text>đang giao</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-[80px] bg-gray-000 border-2 border-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold text-xl">10</Text>
              <Text className="text-center">giao thành công</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-[80px] bg-gray-000 border-2 border-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold text-xl text-red-500">10</Text>
              <Text className="text-center text-red-500">giao thất bại</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* STATISTICS */}
        <View className="w-full items-center p-2">
          <View className="w-full flex-row justify-between items-center mb-3">
            <Text className="text-lg text-gray-600">Thống kê bán hàng</Text>
            <Text className="text-gray-600 opacity-85 italic pr-4">
              {"Tháng 9"}
            </Text>
          </View>
          <View className="w-full h-[80px] bg-gray-000 flex-col rounded-xl items-center justify-center mb-3 bg-yellow-100">
            <Text className="font-semibold">Doanh thu tháng</Text>
            <Text className="text-center text-lg font-bold">10.000.000 đ</Text>
          </View>
          <View className="w-full flex-row gap-2 items-between">
            <TouchableOpacity className="flex-1 h-[80px]  bg-yellow-100 flex-col rounded-xl items-center justify-center p-1">
              <Text className="font-semibold text-green-500">10</Text>
              <Text className="text-center text-green-500">
                Đơn hàng {"\n"} thành công
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-[80px]  bg-yellow-100  flex-col rounded-xl items-center justify-center p-1">
              <Text className="font-semibold text-red-500">10</Text>
              <Text className="text-center text-red-500">
                Đơn hàng thất bại/hoàn tiền
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-[80px] bg-yellow-100 rounded-xl items-center justify-center p-1 ">
              <Text className="font-semibold text-purple-500">10</Text>
              <Text className="text-center text-purple-500">
                Đơn hàng {"\n"}hủy/từ chối
              </Text>
            </TouchableOpacity>
          </View>
          <CustomButton
            handlePress={() => router.push("/shop/statistics")}
            title="Xem chi tiết thống kê"
            iconRight={
              <View className="mt-[-3px] ml-[3px]">
                <Ionicons
                  size={17}
                  name="arrow-forward-outline"
                  color="#FFB200"
                />
              </View>
            }
            containerStyleClasses="h-[42px] border-gray-400 border-2 bg-white mt-4"
            textStyleClasses="text-[14px] font-medium text-[#FFB200]"
          />
        </View>
      </ScrollView>
    </View>
  );
}
