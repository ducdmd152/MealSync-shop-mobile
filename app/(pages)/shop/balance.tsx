import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
} from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import utilService from "@/services/util-service";
import CONSTANTS from "@/constants/data";
import { endpoints } from "@/services/api-services/api-service-instances";
import apiClient from "@/services/api-services/api-client";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import {
  BalanceModel,
  sampleWalletTransactionList,
  WalletTransaction,
} from "@/types/models/BalanceModel";
import ValueResponse from "@/types/responses/ValueReponse";
import { useFocusEffect } from "expo-router";
import FetchResponse from "@/types/responses/FetchResponse";
import sessionService from "@/services/session-service";
import dayjs from "dayjs";

const Balance = () => {
  const balanceFetch = useFetchWithRQWithFetchFunc(
    [endpoints.BALANCE].concat(["withdrawal-create-page"]),
    async (): Promise<ValueResponse<BalanceModel>> =>
      apiClient.get(endpoints.BALANCE).then((response) => response.data),
    []
  );
  const transactionsFetch = useFetchWithRQWithFetchFunc(
    [endpoints.WITHDRAWAL_LIST].concat(["balance-page"]),
    async (): Promise<FetchResponse<WalletTransaction>> =>
      apiClient
        .get(endpoints.WALLET_TRANSACTIONS, {
          headers: {
            Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            // startDate: fromDate.toISOString(),
            // endDate: toDate.add(1, "day").toISOString(),
            pageIndex: 1,
            pageSize: 100_000_000,
          },
        })
        .then((response) => response.data),
    []
  );
  useFocusEffect(
    React.useCallback(() => {
      balanceFetch.refetch();
      transactionsFetch.refetch();
    }, [])
  );
  return (
    <PageLayoutWrapper isScroll={false}>
      <View className="p-2 w-full">
        <ImageBackground
          source={{ uri: CONSTANTS.url.balanceBackgroundImage }}
          style={{ ...styles.backgroundImage }}
          resizeMode="cover"
        >
          <View className="w-full bg-gray-000 flex-col items-center justify-center p-4 py-10 pb-5 backdrop-blur-lg bg-white/3 rounded-lg">
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
                    textShadowOffset: { width: -1, height: 0.2 },
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
            <View className="w-full py-4 mt-2 backdrop-blur-xl  ">
              <View className="mb-2 relative">
                <Text className="absolute text-[12.8px]  top-[-4px] left-2 px-1 bg-white/3 z-10 italic backdrop-blur-md text-gray-500 text-[13.2px] text-gray-500 text-[13.2px]">
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
                <Text className="absolute right-3 top-5 text-[12.8px] italic"></Text>
              </View>
              <View className="w-full flex-row gap-x-[2px] items-center flex-wrap">
                <View className="flex-1 min-w-[30%] mb-2 relative">
                  <Text className="absolute text-[12.8px]  top-[-4px] left-2 px-1 bg-white/2 z-10 italic backdrop-blur-md text-gray-500 text-[13.2px] text-gray-500 text-[13.2px]">
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
                <View className="flex-1 min-w-[30%] mb-2 relative \">
                  <Text className="absolute text-[12.8px]  top-[-4px] left-2 px-1 bg-white/2 z-10 italic backdrop-blur-md text-gray-500 text-[13.2px] text-gray-500 text-[13.2px] rounded-md">
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
                            // || 10000000
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
      <ScrollView
        style={{ width: "100%", flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            tintColor={"#FCF450"}
            onRefresh={() => {
              balanceFetch.refetch();
              transactionsFetch.refetch();
            }}
            refreshing={balanceFetch.isFetching || transactionsFetch.isFetching}
          />
        }
      >
        {!transactionsFetch.isFetching &&
        !transactionsFetch.data?.value.items?.length ? (
          <Text className="text-gray-600 text-center mt-6">
            {transactionsFetch.data?.value.items?.length == 0
              ? "Chưa có bất kì giao dịch nào"
              : "Mất kết nối, vui lòng thử lại"}
          </Text>
        ) : (
          <Text className="text-gray-600 text-center mt-3">
            Lịch sử giao dịch
          </Text>
        )}
        <View className=" p-2 mt-2 pb-[72px]">
          {(transactionsFetch.data?.value.items.length
            ? transactionsFetch.data?.value.items
            : sampleWalletTransactionList
          ).map((transaction, index) => (
            <TouchableOpacity
              onPress={() => {}}
              key={transaction.description + (Math.random() % 100_000_000)}
              className={`p-4 pt-3 bg-white ${
                index % 2 == 1 && "bg-[#fffbeb]"
              }`}
            >
              <View className="flex-row flex-1 justify-start items-start">
                <View className="self-center border-[1px] border-gray-200 mr-2 ml-[-2px] rounded-full p-[1px] overflow-hidden mb-1">
                  <Image
                    source={{
                      uri: CONSTANTS.url.transaction_circle,
                    }}
                    resizeMode="cover"
                    className="h-[40px] w-[40px] opacity-85"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[12.5px] font-semibold mt-[-2px]"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {transaction.description}
                  </Text>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-[11px] italic text-gray-500 ">
                        {dayjs(transaction.createdDate)
                          .local()
                          .format("HH:mm - DD/MM/YYYY")}{" "}
                      </Text>
                      <Text className="text-[11px] italic text-gray-500 ">
                        Số dư sau giao dịch:{" "}
                        {utilService.formatPrice(transaction.totalAmountAfter)}
                        {"₫"}
                      </Text>
                    </View>
                    <Text
                      className={`text-[11px] italic text-gray-500 ${
                        transaction.amount > 0
                          ? "text-green-600"
                          : "text-red-700"
                      } font-semibold`}
                    >
                      {transaction.amount > 0 ? "+" : "-"}
                      {utilService.formatPrice(Math.abs(transaction.amount))}
                      {"₫"}
                    </Text>
                  </View>
                </View>
              </View>
              {/* <View className="flex-row justify-end gap-2 pt-2">
                    <TouchableOpacity
                      onPress={() => {
                        globalWithdrawalState.setWithdrawal(draw);
                        // router.push("/promotion/update");
                      }}
                      className="bg-[#227B94] border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                    >
                      <Text className="text-[13.2px] text-white">
                        Chỉnh sửa
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        globalWithdrawalState.setWithdrawal(draw);
                        router.push("/promotion/details");
                      }}
                      className="bg-white border-[#227B94] border-2 rounded-md items-center justify-center px-[6px] py-[2.2px]"
                    >
                      <Text className="text-[13.2px]">Chi tiết</Text>
                    </TouchableOpacity>
                  </View> */}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
