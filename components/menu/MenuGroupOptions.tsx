import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React from "react";
import CustomButton from "../custom/CustomButton";
import { ActivityIndicator, Searchbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { endpoints } from "@/services/api-services/api-service-instances";
import FetchResponse from "@/types/responses/FetchResponse";
import OptionGroupModel from "@/types/models/OptionGroupModel";
import sessionService from "@/services/session-service";
import apiClient from "@/services/api-services/api-client";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import usePathState from "@/hooks/states/usePathState";
import ValueResponse from "@/types/responses/ValueReponse";
import useModelState from "@/hooks/states/useModelState";

const MenuGroupOptions = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { notFoundInfo, setNotFoundInfo } = usePathState();
  const setOptionGroupModel = useModelState(
    (state) => state.setOptionGroupModel
  );
  const {
    data: optionGroups,
    isLoading: isOptionGroupsLoading,
    error: optionGroupsError,
    refetch: optionGroupsRefetch,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.OPTION_GROUP_LIST,
    async (): Promise<FetchResponse<OptionGroupModel>> =>
      apiClient
        .get(endpoints.OPTION_GROUP_LIST, {
          headers: {
            Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            pageIndex: 1,
            pageSize: 100_000_000,
          },
        })
        .then((response) => response.data),
    []
  );
  useFocusEffect(
    React.useCallback(() => {
      optionGroupsRefetch();
    }, [])
  );

  return (
    <View className="w-full h-full bg-white text-black  relative">
      <View className="absolute w-full items-center justify-center bottom-28 left-0 z-10">
        <CustomButton
          title="Thêm nhóm lựa chọn"
          handlePress={() => {
            router.push("/menu/option-group/create");
          }}
          containerStyleClasses="w-[98%] h-[50px] px-4 bg-transparent border-2 border-gray-200 bg-primary-100 font-psemibold z-10"
          // iconLeft={
          //   <Ionicons name="add-circle-outline" size={21} color="white" />
          // }
          textStyleClasses="text-[15px] text-gray-900 ml-1 text-white"
        />
      </View>
      <View className="w-full gap-2 p-4">
        <View className="w-full">
          <Searchbar
            style={{
              height: 40,
              // backgroundColor: "white",
              // borderColor: "lightgray",
              // borderWidth: 2,
            }}
            inputStyle={{ minHeight: 0 }}
            placeholder="Nhập tiêu đề nhóm..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>
        {isOptionGroupsLoading ? (
          <ActivityIndicator
            animating={isOptionGroupsLoading}
            color="#FCF450"
          />
        ) : (
          <Text className="text-right italic gray-700">
            {optionGroups?.value.items.length} nhóm lựa chọn có sẵn
          </Text>
        )}
        <ScrollView style={{ width: "100%", flexGrow: 1 }}>
          <View className="gap-y-2 pb-[240px]">
            <ScrollView style={{ width: "100%", flexGrow: 1 }}>
              <View className="gap-y-1">
                {optionGroups?.value.items.map((item) => (
                  <View
                    key={item.id}
                    className="p-4 pt-3 bg-white drop-shadow-lg rounded-lg shadow border-2 border-gray-200"
                  >
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-row flex-1 justify-start items-start gap-x-2">
                        {/* <View className="self-stretch">
                        <Image
                          source={{
                            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdcArSQUEt5D7oqzkUhMpP-PIQK6g6BtbFow&s",
                          }}
                          resizeMode="cover"
                          className="h-[52px] w-[62px] rounded-md opacity-85"
                        />
                      </View> */}
                        <View className="flex-1">
                          <Text
                            className="text-[14px] font-psemibold mt-[-2px]"
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {item.title}
                          </Text>
                          <Text
                            className="text-[12px] italic text-gray-500"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {item.options?.map((o) => o.title).join(", ")}
                          </Text>
                        </View>
                      </View>
                      <Text className="bg-blue-100 text-blue-800 text-[12px] font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        Status
                      </Text>
                    </View>
                    <View className="flex-row justify-start gap-2 pt-3">
                      <TouchableOpacity
                        onPress={async () => {
                          setNotFoundInfo(
                            notFoundInfo.message,
                            "/menu",
                            notFoundInfo.linkDesc
                          );
                          try {
                            const response = await apiClient.get<
                              ValueResponse<OptionGroupModel>
                            >(`shop-owner/option-group/${item.id}`);
                            setOptionGroupModel(response.data.value);
                            router.push("/menu/option-group/update");
                            // console.log("Food Detail model: ", foodDetailModel);
                          } catch (error: any) {
                            if (
                              error.response &&
                              error.response.status === 404
                            ) {
                              Alert.alert("Oops!", "Nhóm này không tồn tại!");
                              optionGroupsRefetch();
                            } else {
                              Alert.alert(
                                "Oops!",
                                error?.response?.data?.error?.message ||
                                  "Hệ thống đang bảo trì, vui lòng thử lại sau!"
                              );
                            }
                          }
                        }}
                        className="bg-[#227B94] border-[#227B94] border-0 rounded-md items-center justify-center px-[6px] py-[2.2px] bg-white "
                      >
                        <Text className="text-[13.5px] text-white text-[#227B94] font-semibold">
                          Chỉnh sửa
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async () => {
                          setNotFoundInfo(
                            notFoundInfo.message,
                            "/menu",
                            notFoundInfo.linkDesc
                          );
                          try {
                            const response = await apiClient.get<
                              ValueResponse<OptionGroupModel>
                            >(`shop-owner/option-group/${item.id}`);
                            setOptionGroupModel(response.data.value);
                            router.push("/menu/option-group/link");
                            // console.log("Food Detail model: ", foodDetailModel);
                          } catch (error: any) {
                            if (
                              error.response &&
                              error.response.status === 404
                            ) {
                              Alert.alert("Oops!", "Nhóm này không tồn tại!");
                              optionGroupsRefetch();
                            } else {
                              Alert.alert(
                                "Oops!",
                                error?.response?.data?.error?.message ||
                                  "Hệ thống đang bảo trì, vui lòng thử lại sau!"
                              );
                            }
                          }
                        }}
                        className="bg-[#227B94] border-[#227B94] border-0 rounded-md items-center justify-center px-[6px] py-[2.2px] bg-white "
                      >
                        <Text className="text-[13.5px] text-white text-[#227B94] font-semibold">
                          {item.numOfItemLinked} món đang liên kết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default MenuGroupOptions;
