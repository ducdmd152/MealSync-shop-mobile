import useGPKGState from "@/hooks/states/useGPKGState";
import useGlobalCompleteDeliveryConfirm from "@/hooks/states/useGlobalCompleteDeliveryConfirm";
import apiClient from "@/services/api-services/api-client";
import sessionService from "@/services/session-service";
import utilService from "@/services/util-service";
import { DeliveryPackageGroupDetailsModel } from "@/types/models/DeliveryPackageModel";
import OrderFetchModel, {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { ShopDeliveryStaff } from "@/types/models/StaffInfoModel";
import { FrameDateTime } from "@/types/models/TimeModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import CustomModal from "../common/CustomModal";
import CustomButton from "../custom/CustomButton";
import CompleteDeliveryConfirmModal from "../target-modals/CompleteDeliveryConfirmModal";
import OrderDeliveryAssign from "./OrderDeliveryAssign";
interface Props {
  query: FrameDateTime;
  selectedDetail: DeliveryPackageGroupDetailsModel;
  setSelectedDetail: (model: DeliveryPackageGroupDetailsModel) => void;
  onNotFound?: () => void;
  containerStyleClasses?: string;
  onClose: () => void;
}
const initExtend = false;
const detailBottomHeight = Dimensions.get("window").height - 150;
const DeliveryFrameDetail = ({
  selectedDetail,
  setSelectedDetail,
  query,
  onNotFound = () => {},
  containerStyleClasses = "",
  onClose,
}: Props) => {
  const globalGPKGState = useGPKGState();
  const globalCompleteDeliveryConfirm = useGlobalCompleteDeliveryConfirm();
  const [isEditable, setIsEditable] = useState(true);
  const gPKGDetails = selectedDetail;
  const setGPKGDetails = setSelectedDetail;
  // const [gPKGDetails, setGPKGDetails] =
  //   useState<DeliveryPackageGroupDetailsModel>();
  const [extendPKGs, setExtendPKGs] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReloading, setIsReLoading] = useState(false);

  const [order, setOrder] = useState<OrderFetchModel>({} as OrderFetchModel);
  const [isOpenOrderAssign, setIsOpenOrderAssign] = React.useState(false);
  const getGPKGDetails = async (isFirstTime = false) => {
    setIsLoading(true);
    if (!isFirstTime) setIsReLoading(true);
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
      setIsReLoading(false);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      getGPKGDetails(true);
      setIsEditable(!utilService.isCurrentTimeGreaterThanEndTime(query));
    }, [])
  );

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

  // console.log("gPKGDetails: ", gPKGDetails);
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
      {gPKGDetails && gPKGDetails.deliveryPackageGroups?.length > 0 && (
        <Text className="mt-2 text-[14px] text-gray-700 italic text-right">
          {gPKGDetails?.deliveryPackageGroups.length} gói hàng được phân công
        </Text>
      )}
      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={"#FCF450"}
            refreshing={isReloading}
            onRefresh={() => {
              // console.log("Refreshing");
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
          {gPKGDetails &&
            gPKGDetails.deliveryPackageGroups?.map((pkg, index) => (
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
                          {dorm.id == 1 ? "KTX Khu A" : "KTX Khu B"} (
                          {dorm.total} đơn)
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
                                globalCompleteDeliveryConfirm.setIsShowActionale(
                                  true
                                );

                                globalCompleteDeliveryConfirm.setId(order.id);
                                globalCompleteDeliveryConfirm.setOnAfterCompleted(
                                  () => getGPKGDetails()
                                );
                                globalCompleteDeliveryConfirm.setIsModalVisible(
                                  true
                                );
                                globalCompleteDeliveryConfirm.setModel(order);
                                globalCompleteDeliveryConfirm.setStep(0);
                              }}
                              className="p-[4px] my-[1px] px-[6px] bg-white border-2 border-gray-300 rounded-lg"
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
                                      backgroundColor:
                                        getOrderStatusDescription(order.status)
                                          ?.bgColor,
                                    }}
                                  >
                                    {
                                      getOrderStatusDescription(order.status)
                                        ?.description
                                    }
                                  </Text>
                                  {isEditable &&
                                    order.status <= OrderStatus.Delivering && (
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
                                          order.status > OrderStatus.Delivering
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
                                      uri: order.orderDetails[0].imageUrl,
                                    }}
                                    resizeMode="cover"
                                    className="h-[12px] w-[12px] rounded-md opacity-85"
                                  />
                                  <Text className="text-xs italic text-gray-500">
                                    {order.orderDetailSummaryShort}
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
              {`(${gPKGDetails?.unassignOrders?.length || 0} đơn hàng)`}
            </Text>
            {/* {isLoading && (
              <ActivityIndicator animating={true} color="#FCF450" />
            )} */}
            {gPKGDetails?.unassignOrders
              // .filter((order) => order.dormitoryId == dorm.id)
              ?.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => {
                    globalCompleteDeliveryConfirm.setIsShowActionale(true);
                    globalCompleteDeliveryConfirm.setId(order.id);
                    globalCompleteDeliveryConfirm.setOnAfterCompleted(() =>
                      getGPKGDetails()
                    );
                    globalCompleteDeliveryConfirm.setIsModalVisible(true);
                    globalCompleteDeliveryConfirm.setModel(order);
                    globalCompleteDeliveryConfirm.setStep(0);
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
                      {isEditable && order.status <= OrderStatus.Delivering && (
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
                          disabled={order.status > OrderStatus.Delivering}
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
                          uri: order.orderDetails[0].imageUrl,
                        }}
                        resizeMode="cover"
                        className="h-[12px] w-[12px] rounded-md opacity-85"
                      />
                      <Text className="text-xs italic text-gray-500">
                        {order.orderDetailSummaryShort}
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

      <CompleteDeliveryConfirmModal
        onParentOpen={() => {}}
        onParentClose={() => {}}
      />
      <CustomModal
        title={`MS-${order.id} Chi tiết đặt hàng`}
        hasHeader={false}
        isOpen={isOpenOrderAssign}
        setIsOpen={(value) => setIsOpenOrderAssign(value)}
        titleStyleClasses="text-center flex-1"
        containerStyleClasses="w-[98%]"
        onBackdropPress={() => {
          setIsOpenOrderAssign(false);
        }}
      >
        <OrderDeliveryAssign
          onComplete={(shopDeliveryStaff) => {
            setIsOpenOrderAssign(false);
            getGPKGDetails();
            if (shopDeliveryStaff === null) {
              return;
            }
            Toast.show({
              type: "info",
              text1: "Hoàn tất",
              text2: `Đơn hàng MS-${order.id} sẽ được giao bởi ${
                shopDeliveryStaff.id == 0 ? "bạn" : shopDeliveryStaff.fullName
              }!`,
              // time: 15000
            });
          }}
          order={order}
          isNeedForReconfimation={order.shopDeliveryStaff ? false : true}
        />
      </CustomModal>
      <Toast position="bottom" />
      {/* <Portal> */}
      {/* <ModalPaper
        visible={isOpenOrderAssign}
        onDismiss={() => setIsOpenOrderAssign(false)}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 20,
          margin: 5,
          zIndex: 1000,
        }}
      >
        
      </ModalPaper> */}
      {/* </Portal> */}
    </View>
  );
};

export default DeliveryFrameDetail;
