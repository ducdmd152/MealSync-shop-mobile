import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FrameDateTime } from "@/types/models/TimeModel";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import apiClient from "@/services/api-services/api-client";
import {
  DeliveryPackageGroupDetailsModel,
  DeliveryPackageGroupModel,
} from "@/types/models/DeliveryPackageModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import utilService from "@/services/util-service";
import sessionService from "@/services/session-service";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import CustomButton from "../custom/CustomButton";
import OrderFetchModel, {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { Ionicons } from "@expo/vector-icons";
import { boolean } from "yup";
import {
  ActivityIndicator,
  Portal,
  Modal as ModalPaper,
} from "react-native-paper";
import OrderDeliveryAssign from "./OrderDeliveryAssign";
import { ShopDeliveryStaff } from "@/types/models/StaffInfoModel";
import { router } from "expo-router";
import useGPKGState from "@/hooks/states/useGPKGState";
import useGlobalOrderDetailState from "@/hooks/states/useGlobalOrderDetailState";
interface Props {
  query: FrameDateTime;
  onNotFound?: () => void;
  containerStyleClasses?: string;
  onClose: () => void;
}
const initExtend = false;
const detailBottomHeight = Dimensions.get("window").height - 220;
const DeliveryFrameDetail = ({
  query,
  onNotFound = () => {},
  containerStyleClasses = "",
  onClose,
}: Props) => {
  const globalGPKGState = useGPKGState();
  const [isEditable, setIsEditable] = useState(true);
  const [gPKGDetails, setGPKGDetails] =
    useState<DeliveryPackageGroupDetailsModel>(
      {} as DeliveryPackageGroupDetailsModel
    );
  const [extendPKGs, setExtendPKGs] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderFetchModel>({} as OrderFetchModel);
  const [isOpenOrderAssign, setIsOpenOrderAssign] = React.useState(false);
  const globalOrderDetailState = useGlobalOrderDetailState();
  const getGPKGDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<
        FetchValueResponse<DeliveryPackageGroupDetailsModel>
      >(`shop-owner/delivery-package-group`, {
        headers: {
          Authorization: `Bearer ${await sessionService.getAuthToken()}`,
        },
        params: {
          ...query,
        },
      });
      setGPKGDetails({ ...response.data.value });
    } catch (error: any) {
      onNotFound();
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getGPKGDetails();
    setIsEditable(!utilService.isCurrentTimeGreaterThanEndTime(query));
  }, [query]);
  // console.log("getCurrentUTCDate", utilService.getCurrentUTCDate());
  const getIsExtendPGK = (index: number) => {
    if (!gPKGDetails?.deliveryPackageGroups) return !initExtend;
    if (extendPKGs.length < gPKGDetails?.deliveryPackageGroups.length) {
      setExtendPKGs(
        Array(gPKGDetails.deliveryPackageGroups.length).fill(initExtend)
      );
      return true;
    }
    return index < extendPKGs.length ? extendPKGs[index] : !initExtend;
  };
  const setIsExtendPKGAtIndex = (index: number, value: boolean) => {
    setExtendPKGs((prevExtendPKGs) => {
      const newExtendPKGs = [...prevExtendPKGs];
      newExtendPKGs[index] = value;
      return newExtendPKGs;
    });
  };

  //   console.log(gPKGDetails);
  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-[14px] text-gray-700 italic">
          Khung giao hàng:
        </Text>
        <View className="flex-row">
          <Text className="font-semibold bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
            {utilService.formatTime(query.startTime) +
              " - " +
              utilService.formatTime(query.endTime)}
          </Text>
          <Text className="ml-2 bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[12px] rounded">
            {utilService.formatDateDdMmYyyy(query.intendedReceiveDate)}
          </Text>
        </View>
      </View>
      {gPKGDetails?.deliveryPackageGroups?.length > 0 && (
        <Text className="mt-2 text-[14px] text-gray-700 italic text-right">
          {gPKGDetails?.deliveryPackageGroups.length} gói hàng được phân công
        </Text>
      )}
      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={"#FCF450"}
            refreshing={isLoading}
            onRefresh={() => {
              getGPKGDetails();
            }}
          />
        }
      >
        <View
          className="gap-y-2 mt-[2px] ml-1"
          style={{
            minHeight: detailBottomHeight,
          }}
        >
          {gPKGDetails?.deliveryPackageGroups?.map((pkg, index) => (
            <View
              key={pkg.deliveryPackageId}
              className="p-2 border-2 border-gray-200 rounded-md"
            >
              <TouchableOpacity
                className={`flex-row items-center justify-between bg-gray-200 rounded-xl px-2 py-2`}
                onPress={() =>
                  setIsExtendPKGAtIndex(index, !getIsExtendPGK(index))
                }
              >
                <View className="flex-row items-center gap-x-1">
                  <Image
                    source={{ uri: pkg.shopDeliveryStaff.avatarUrl }}
                    resizeMode="cover"
                    className="h-[18px] w-[18px] rounded-md opacity-85"
                  />
                  <Text>
                    {utilService.shortenName(pkg.shopDeliveryStaff.fullName)}
                    {pkg.shopDeliveryStaff.id == 0 && " (bạn)"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-x-1">
                  <Text className="mx-2 text-[12px]">
                    Hoàn thành {pkg.successful + pkg.failed}/{pkg.total}
                  </Text>
                  {getIsExtendPGK(index) ? (
                    <Ionicons
                      name="chevron-down-outline"
                      size={21}
                      color="gray"
                    />
                  ) : (
                    <Ionicons
                      name="chevron-up-outline"
                      size={21}
                      color="gray"
                    />
                  )}
                </View>
              </TouchableOpacity>

              {getIsExtendPGK(index) && (
                <View className="mt-2 border-[1px] border-gray-100 p-1 pt-0">
                  {pkg.dormitories.map((dorm) => (
                    <View key={dorm.id} className="mt-1">
                      <Text className="text-[10px]">
                        {dorm.id == 1 ? "KTX Khu A" : "KTX Khu B"} ({dorm.total}{" "}
                        đơn)
                      </Text>
                      <Text className="text-[10px] text-gray-600">
                        {dorm.delivering} đang giao | {dorm.successful} giao
                        thành công | {dorm.failed} giao thất bại |{" "}
                        {dorm.waiting} chưa giao
                      </Text>
                      <View className="border-[0.5px] border-gray-200 my-1" />
                      {pkg.orders
                        .filter((order) => order.dormitoryId == dorm.id)
                        .map((order) => (
                          <TouchableOpacity
                            key={order.id}
                            onPress={() => {
                              // globalOrderDetailState.setId(order.id);
                              // globalOrderDetailState.setIsActionsShowing(true);
                              // globalOrderDetailState.setIsDetailBottomSheetVisible(
                              //   true
                              // );
                            }}
                            className="p-[4px] px-[6px] bg-white border-2 border-gray-300 rounded-lg"
                          >
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center">
                                <Text className="text-[10px] bg-gray-100 text-gray-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100">
                                  MS-{order.id}
                                </Text>
                              </View>
                              <View className="flex-row gap-x-1 items-center">
                                {/* <Text className="ml-2   bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[10px] rounded ">
                                {order.dormitoryId == 1
                                  ? "Đến KTX khu A"
                                  : "Đến KTX khu B"}
                              </Text> */}
                                <Text
                                  className={`text-[10px] font-medium me-2 px-2.5 py-0.5 rounded ${
                                    getOrderStatusDescription(order.status)
                                      ?.bgColor
                                  }`}
                                  style={{
                                    backgroundColor: getOrderStatusDescription(
                                      order.status
                                    )?.bgColor,
                                  }}
                                >
                                  {
                                    getOrderStatusDescription(order.status)
                                      ?.description
                                  }
                                </Text>
                                {isEditable && (
                                  <TouchableOpacity
                                    onPress={() => {
                                      if (
                                        utilService.isCurrentTimeGreaterThanEndTime(
                                          query
                                        )
                                      ) {
                                        Alert.alert(
                                          "Oops!",
                                          "Đã quá thời gian cho phép chỉnh sửa!"
                                        );
                                        setIsEditable(false);
                                        return;
                                      }
                                      setOrder(order);
                                      setIsOpenOrderAssign(true);
                                    }}
                                    className={` flex-row items-center rounded-md items-center justify-center px-[6px] py-[2.2px] bg-[#227B94]`}
                                    disabled={
                                      order.status != OrderStatus.Preparing
                                    }
                                  >
                                    <Text className="text-[12px] text-white mr-1">
                                      Thay đổi
                                    </Text>
                                    <Ionicons
                                      name="person-outline"
                                      size={12}
                                      color="white"
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                            <View className="flex-row justify-between items-center mt-[4px]">
                              <View className="flex-1 flex-row justify-start items-center gap-2">
                                <Image
                                  source={{
                                    uri: order.foods[0].imageUrl,
                                  }}
                                  resizeMode="cover"
                                  className="h-[12px] w-[12px] rounded-md opacity-85"
                                />
                                <Text className="text-xs italic text-gray-500">
                                  {order.foods[0].name}{" "}
                                  {order.foods[0].quantity > 1 &&
                                    " x" + order.foods[0].quantity}
                                  {order.foods.length > 1 &&
                                    " +" +
                                      (order.foods.length - 1) +
                                      " món khác"}
                                </Text>
                              </View>
                              <View className="flex-row gap-x-1 items-center">
                                <Text
                                  className={`text-[10px] font-medium me-2 px-2.5 py-1 rounded `}
                                >
                                  {utilService.formatPrice(
                                    order.totalPrice - order.totalPromotion
                                  )}{" "}
                                  ₫
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
          <View className="p-1 border-2 border-gray-200 rounded-md">
            <Text className="mt-1 italic text-gray-700 text-center mb-1 text-[10px]">
              Danh sách đơn hàng đang trống{" "}
              {!isLoading &&
                `(${gPKGDetails?.unassignOrders?.length || 0} đơn hàng)`}
            </Text>
            {isLoading && (
              <ActivityIndicator animating={true} color="#FCF450" />
            )}
            {gPKGDetails?.unassignOrders
              // .filter((order) => order.dormitoryId == dorm.id)
              ?.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => {
                    // setOrderDetailId(order.id);
                    // setOrder(order);
                    // setIsDetailBottomSheetVisible(true);
                  }}
                  className="p-[4px] px-[6px] bg-white border-2 border-gray-300 rounded-lg"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-[10px] bg-gray-100 text-gray-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-200 dark:text-dark-100">
                        MS-{order.id}
                      </Text>
                    </View>
                    <View className="flex-row gap-x-1 items-center">
                      <Text className="ml-2   bg-blue-100 text-blue-800 font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-500 text-[10px] rounded ">
                        {order.dormitoryId == 1
                          ? "Đến KTX khu A"
                          : "Đến KTX khu B"}
                      </Text>
                      {isEditable && (
                        <TouchableOpacity
                          onPress={() => {
                            if (
                              utilService.isCurrentTimeGreaterThanEndTime(query)
                            ) {
                              Alert.alert(
                                "Oops!",
                                "Đã quá thời gian cho phép chỉnh sửa!"
                              );
                              setIsEditable(false);
                              return;
                            }
                            setOrder(order);
                            setIsOpenOrderAssign(true);
                          }}
                          className={` flex-row items-center rounded-md items-center justify-center px-[6px] py-[2.2px] bg-[#227B94]`}
                          disabled={order.status != OrderStatus.Preparing}
                        >
                          <Text className="text-[12px] text-white mr-1">
                            Phân công
                          </Text>
                          <Ionicons
                            name="person-add-outline"
                            size={12}
                            color="white"
                          />
                        </TouchableOpacity>
                      )}
                      {/* <Text
                        className={`text-[10px] font-medium me-2 px-2.5 py-0.5 rounded ${
                          getOrderStatusDescription(order.status)?.bgColor
                        }`}
                        style={{
                          backgroundColor: getOrderStatusDescription(
                            order.status
                          )?.bgColor,
                        }}
                      >
                        {getOrderStatusDescription(order.status)?.description}
                      </Text> */}
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center mt-[4px]">
                    <View className="flex-1 flex-row justify-start items-center gap-2">
                      <Image
                        source={{
                          uri: order.foods[0].imageUrl,
                        }}
                        resizeMode="cover"
                        className="h-[12px] w-[12px] rounded-md opacity-85"
                      />
                      <Text className="text-xs italic text-gray-500">
                        {order.foods[0].name}{" "}
                        {order.foods[0].quantity > 1 &&
                          " x" + order.foods[0].quantity}
                        {order.foods.length > 1 &&
                          " +" + (order.foods.length - 1) + " món khác"}
                      </Text>
                    </View>
                    {/* <View className="flex-row gap-x-1 items-center">
                      <Text
                        className={`text-[10px] font-medium me-2 px-2.5 py-1 rounded `}
                      >
                        {utilService.formatPrice(
                          order.totalPrice - order.totalPromotion
                        )}{" "}
                        ₫
                      </Text>
                    </View> */}
                    <View className="flex-row gap-x-1 items-center">
                      <Text
                        className={`text-[10px] font-medium me-2 px-2.5 py-1 rounded `}
                      >
                        {getOrderStatusDescription(order.status)?.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </ScrollView>
      {isEditable && (
        <CustomButton
          title="Chỉnh sửa"
          //   isLoading={isSubmitting}
          handlePress={() => {
            if (utilService.isCurrentTimeGreaterThanEndTime(query)) {
              Alert.alert("Oops!", "Đã quá thời gian cho phép chỉnh sửa!");
              setIsEditable(false);
              return;
            }
            onClose();
            globalGPKGState.setQuery({ ...query });
            router.push("/delivery-package-group/update");
          }}
          containerStyleClasses="mt-5 h-[40px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold"
          textStyleClasses="text-[16px] text-gray-900 ml-1 text-white"
        />
      )}

      {/* <Portal> */}
      <ModalPaper
        visible={isOpenOrderAssign}
        onDismiss={() => setIsOpenOrderAssign(false)}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 20,
          margin: 5,
          zIndex: 1000,
        }}
      >
        <OrderDeliveryAssign
          onComplete={(shopDeliveryStaff: ShopDeliveryStaff) => {
            setIsOpenOrderAssign(false);
            getGPKGDetails();
          }}
          order={order}
          isNeedForReconfimation={order.shopDeliveryStaff ? false : true}
        />
      </ModalPaper>
      {/* </Portal> */}
    </View>
  );
};

export default DeliveryFrameDetail;
