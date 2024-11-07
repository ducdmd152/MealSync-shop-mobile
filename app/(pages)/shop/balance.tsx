import { View, Text, ImageBackground, StyleSheet } from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import utilService from "@/services/util-service";
import { TextInput } from "react-native-gesture-handler";
import CONSTANTS from "@/constants/data";
import { endpoints } from "@/services/api-services/api-service-instances";
import apiClient from "@/services/api-services/api-client";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import { BalanceModel } from "@/types/models/BalanceModel";
import ValueResponse from "@/types/responses/ValueReponse";
import { useFocusEffect } from "expo-router";

const Balance = () => {
  const balanceFetch = useFetchWithRQWithFetchFunc(
    [endpoints.BALANCE].concat(["withdrawal-create-page"]),
    async (): Promise<ValueResponse<BalanceModel>> =>
      apiClient.get(endpoints.BALANCE).then((response) => response.data),
    []
  );
  useFocusEffect(
    React.useCallback(() => {
      balanceFetch.refetch();
    }, [])
  );
  return (
    <PageLayoutWrapper>
      <View className="flex-1 p-2 w-full">
        <ImageBackground
          source={{ uri: CONSTANTS.url.balanceBackgroundImage }}
          style={{ ...styles.backgroundImage }}
          resizeMode="cover"
        >
          <View className="flex-1 w-full bg-gray-000 flex-col items-center justify-center p-4 py-10 pb-5 backdrop-blur-lg bg-white/3 rounded-lg">
            <View>
              <Text className="text-center mb-1 text-gray-500">Tổng số dư</Text>
              <View className="justify-center items-end gap-x-2 flex-row flex-col items-center ">
                <Text
                  className="font-semibold text-[42px] text-[#fcd34d]"
                  style={{
                    // color: "white",
                    fontSize: 32,
                    fontWeight: "bold",
                    textShadowColor: "gray",
                    textShadowOffset: { width: -0.6, height: 0.2 },
                    textShadowRadius: 1,
                  }}
                >
                  {balanceFetch.data?.value
                    ? utilService.formatPrice(
                        balanceFetch.data.value.availableAmount +
                          balanceFetch.data.value.incomingAmount +
                          balanceFetch.data.value.reportingAmount
                      )
                    : "---------"}
                </Text>
                <Text
                  className="text-[15px] text-[#fcd34d] mb-3 font-semibold"
                  style={{
                    fontWeight: "bold",
                    textShadowColor: "gray",
                    textShadowOffset: { width: -0.1, height: 0.1 },
                    textShadowRadius: 0.2,
                  }}
                >
                  VND
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
        <View className="bg-opacity-10 mt-2 rounded-lg overflow-hidden">
          <ImageBackground
            source={{ uri: CONSTANTS.url.balanceDetailBackgroundImage }}
            style={{ ...styles.backgroundImage, alignItems: "flex-start" }}
            resizeMode="cover"
          >
            <View className="w-full py-4 mt-2 pt-6 backdrop-blur-xl  ">
              <View className="w-full flex-row gap-x-[2px] items-center">
                <View className="flex-1 mb-2 relative">
                  <Text className="absolute text-[12.8px]  top-[-4px] left-2 px-1 bg-white/3 z-10 italic backdrop-blur-md text-gray-500 text-[13.5px] text-gray-500 text-[13.5px]">
                    Có sẵn
                  </Text>
                  <TextInput
                    className="border-0 border-gray-200 mt-1 px-3 pt-3 text-[#fbbf24] text-[18px] "
                    style={{
                      textShadowColor: "gray",
                      textShadowOffset: { width: -0.1, height: 0.1 },
                      textShadowRadius: 0.4,
                    }}
                    value={
                      balanceFetch.data?.value
                        ? utilService.formatPrice(
                            balanceFetch.data.value.availableAmount
                          ) + "₫"
                        : "---------"
                    }
                    onChangeText={(text) => {}}
                    keyboardType="numeric"
                    readOnly
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-3 top-5 text-[12.8px] italic">
                    {/* đ */}
                  </Text>
                </View>
                <View className="min-w-[30%] mb-2 relative">
                  <Text className="absolute text-[12.8px]  top-[-4px] left-2 px-1 bg-white/2 z-10 italic backdrop-blur-md text-gray-500 text-[13.5px] text-gray-500 text-[13.5px]">
                    Đang chờ về
                  </Text>
                  <TextInput
                    className="border-0 border-gray-200 mt-1 px-3 pt-3 pt-3 text-[#fbbf24] text-[18px] "
                    style={{
                      textShadowColor: "gray",
                      textShadowOffset: { width: -0.1, height: 0.1 },
                      textShadowRadius: 0.4,
                    }}
                    value={
                      balanceFetch.data?.value
                        ? utilService.formatPrice(
                            balanceFetch.data.value.incomingAmount
                          ) + "₫"
                        : "---------"
                    }
                    onChangeText={(text) => {}}
                    keyboardType="numeric"
                    readOnly
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-3 top-4 text-[12.8px] italic">
                    {/* đ */}
                  </Text>
                </View>
                <View className="min-w-[30%] mb-2 relative">
                  <Text className="absolute text-[12.8px]  top-[-4px] left-2 px-1 bg-white/2 z-10 italic backdrop-blur-md text-gray-500 text-[13.5px] text-gray-500 text-[13.5px] rounded-md">
                    Báo cáo
                  </Text>
                  <TextInput
                    className="border-0 border-gray-200 mt-1 px-3 pt-3 pt-3 text-[#fbbf24] text-[18px] "
                    style={{
                      textShadowColor: "gray",
                      textShadowOffset: { width: -0.1, height: 0.1 },
                      textShadowRadius: 0.4,
                    }}
                    value={
                      balanceFetch.data?.value
                        ? utilService.formatPrice(
                            balanceFetch.data.value.reportingAmount
                          ) + "₫"
                        : "---------"
                    }
                    onChangeText={(text) => {}}
                    keyboardType="numeric"
                    readOnly
                    placeholderTextColor="#888"
                  />
                  <Text className="absolute right-3 top-4 text-[12.8px] italic">
                    {/* đ */}
                  </Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default Balance;

const styles = StyleSheet.create({
  backgroundImage: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 20,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
