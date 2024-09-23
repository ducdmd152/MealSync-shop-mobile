import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { ThemedText } from "@/components/already-components/ThemedText";
import CustomButton from "@/components/custom/CustomButton";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function HomeScreen() {
  return (
    <View className="w-full h-full flex-1 items-center justify-start bg-white p-2">
      <View className="w-full items-start p-2">
        <Text className="text-lg text-gray-600">Cửa hàng</Text>
        <Text className="text-3xl text-gray text-primary font-pmedium">
          Tiệm ăn tháng năm
        </Text>
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
            <View className="flex-1 h-[80px] bg-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold">10</Text>
              <Text>chờ xác nhận</Text>
            </View>
            <View className="flex-1 h-[80px] bg-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold">10</Text>
              <Text>đã xác nhận</Text>
            </View>
            <View className="flex-1 h-[80px] bg-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold">10</Text>
              <Text>đang chuẩn bị</Text>
            </View>
          </View>
          <View className="w-full flex-row gap-2 items-between mt-2">
            <View className="flex-1 h-[80px] bg-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold">10</Text>
              <Text>đang giao</Text>
            </View>
            <View className="flex-1 h-[80px] bg-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold">10</Text>
              <Text className="text-center">giao thành công</Text>
            </View>
            <View className="flex-1 h-[80px] bg-gray-200 rounded-xl items-center justify-center">
              <Text className="font-semibold">10</Text>
              <Text className="text-center">hủy/giao thất bại</Text>
            </View>
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
          <View className="w-full h-[80px] bg-gray-200 flex-col rounded-xl items-center justify-center mb-3">
            <Text className="font-semibold">Doanh thu</Text>
            <Text className="text-center">10.000.000 đ</Text>
          </View>
          <View className="w-full flex-row gap-2 items-between">
            <View className="flex-1 h-[80px] bg-gray-200 flex-col rounded-xl items-center justify-center p-1">
              <Text className="font-semibold">10</Text>
              <Text className="text-center">Đơn hàng hoàn tất thành công</Text>
            </View>
            <View className="flex-1 h-[80px] bg-gray-200 flex-col rounded-xl items-center justify-center p-1">
              <Text className="font-semibold">10</Text>
              <Text className="text-center">Đơn hàng thất bại/hoàn tiền</Text>
            </View>
            <View className="flex-1 h-[80px] bg-gray-200 rounded-xl items-center justify-center p-1">
              <Text className="font-semibold">10</Text>
              <Text className="text-center">Đơn hàng {"\n"}bị hủy</Text>
            </View>
          </View>
          <CustomButton
            handlePress={() => router.push("/statistics")}
            title="Xem chi tiết thống kê"
            containerStyleClasses="h-[42px] border-gray-400 border-2 bg-white mt-4"
            textStyleClasses="text-[14px] font-medium text-secondary-100"
          />
        </View>
      </ScrollView>
    </View>
  );
}
