import { View, Text, Image, Dimensions, Alert, Linking } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import Modal from "react-native-modal";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import CONSTANTS from "@/constants/data";
import CustomButton from "../custom/CustomButton";
import useGlobalCompleteDeliveryConfirm from "@/hooks/states/useGlobalCompleteDeliveryConfirm";
import { router, useFocusEffect } from "expo-router";
import useGlobalMyPKGDetailsState from "@/hooks/states/useGlobalPKGDetailsState";
import AreaQRScanner from "../common/AreaQRScanner";
import apiClient from "@/services/api-services/api-client";
import Toast from "react-native-toast-message";
import utilService from "@/services/util-service";
import OrderFetchModel, {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import * as Clipboard from "expo-clipboard";
import dayjs from "dayjs";
import { TextInput } from "react-native";
import { DeliveryFailModel } from "@/types/models/DeliveryFailModel";
import PreviewMultiImagesUpload from "../images/PreviewMultiImagesUpload";
import EvidencePreviewMultiImagesUpload from "../images/EvidencePreviewMultiImagesUpload";
import { SelectList } from "react-native-dropdown-select-list";
import orderUIService from "@/services/order-ui-service";
import ValueResponse from "@/types/responses/ValueReponse";
import useGlobalOrderDetailState from "@/hooks/states/useGlobalOrderDetailState";
import useOrderDetailPageState from "@/hooks/states/useOrderDetailPageState";
import OrderDetail from "../order/OrderDetail";
import DeliveryOrderDetail from "../order/DeliveryOrderDetail";
import sessionService from "@/services/session-service";
interface Props {
  containerStyleClasses?: string;
  titleStyleClasses?: string;
  imageStyleClasses?: string;
  onParentOpen?: () => void;
  onParentClose?: () => void;
}
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;
const maxHeight = screenHeight - 280;
interface QRCodeResultModel {
  OrderId: number;
  CustomerId: number;
  ShipperId: number;
  OrderDate: string;
  Token: string;
}
const CompleteDeliveryConfirmModal = ({
  containerStyleClasses = "",
  titleStyleClasses = "",
  imageStyleClasses = "",
  onParentOpen = () => {},
  onParentClose = () => {},
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageHandling, setImageHandling] = useState(false);
  const [imageHandleError, setImageHandleError] = useState<any>(false);
  const globalOrderDetailPageState = useOrderDetailPageState();
  const globalCompleteDeliveryConfirm = useGlobalCompleteDeliveryConfirm();
  const { model: order, setModel: setOrder } = globalCompleteDeliveryConfirm;
  const { step, setStep } = globalCompleteDeliveryConfirm;
  const [authRole, setAuthRole] = useState(0);
  const [request, setRequest] = useState<DeliveryFailModel>({
    reason: "",
    reasonIndentity: 1, // 1. Shop 2. Customer
    evidences: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderDetailViewMode, setIsOrderDetailViewMode] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const getOrderDetail = async (isRefetching = false) => {
    setIsLoading(true);
    if (isRefetching) setIsReloading(true);
    try {
      const response = await apiClient.get<ValueResponse<OrderFetchModel>>(
        `shop-owner/order/${globalCompleteDeliveryConfirm.id}`
      );
      setOrder({ ...response.data.value });
    } catch (error: any) {
      globalCompleteDeliveryConfirm.onAfterCompleted();
      globalCompleteDeliveryConfirm.setIsModalVisible(false);
      Alert.alert(
        "Oops",
        `Không tìm thấy đơn hàng MS-${globalCompleteDeliveryConfirm.id}!`
      );
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
  };
  useEffect(() => {
    if (globalCompleteDeliveryConfirm.isModalVisible) {
      (async () => {
        setAuthRole((await sessionService.getAuthRole()) || 0);
      })();
      setIsOrderDetailViewMode(false);
      setRequest({
        reason: "",
        reasonIndentity: 1, // 1. Shop 2. Customer
        evidences: [],
      });
    }
  }, [globalCompleteDeliveryConfirm.isModalVisible]);
  useFocusEffect(
    useCallback(() => {
      if (globalCompleteDeliveryConfirm.isModalVisible) getOrderDetail(true);
    }, [])
  );

  const handleDeliverySuccess = async (
    data: string,
    onSuccess: () => void,
    onError: (error: any) => void
  ) => {
    const qrCodeResult: QRCodeResultModel = JSON.parse(data);
    return await apiClient
      .put(
        `shop-owner/order/${globalCompleteDeliveryConfirm.id}/delivered`,
        qrCodeResult
      )
      .then((response) => {
        // console.log(response.data);
        onSuccess();
        setOrder({ ...order, status: OrderStatus.Delivered });
        getOrderDetail();
        Toast.show({
          type: "success",
          text1: "Hoàn tất",
          text2: `Đã giao hàng thành công đơn MS-${globalCompleteDeliveryConfirm.id}`,
          // time: 15000
        });

        globalCompleteDeliveryConfirm.onAfterCompleted();
        return true;
      })
      .catch((error: any) => {
        onError(error);
        return false;
      });
  };
  useEffect(() => {
    if (!isImageHandling && isSubmitting) {
      if (imageHandleError) {
        setImageHandleError(false);
        setIsSubmitting(false);
        return;
      }
      requestFailDelivery();
    }
  }, [isImageHandling]);

  const requestFailDelivery = () => {
    apiClient
      .put(
        `shop-owner/order/${globalCompleteDeliveryConfirm.id}/delivery-fail`,
        request
      )
      .then((response) => {
        setOrder({ ...order, status: OrderStatus.FailDelivery });
        getOrderDetail();
        Toast.show({
          type: "info",
          text1: "Hoàn tất",
          text2: `Giao thất bại đơn hàng MS-${globalCompleteDeliveryConfirm.id}`,
          // time: 15000
        });
        setStep(0);
        globalCompleteDeliveryConfirm.onAfterCompleted();
        return true;
      })
      .catch((error: any) => {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
        );
        return false;
      })
      .finally(() => {
        console.log("finally:  setIsSubmitting(false)");
        setIsSubmitting(false);
      });
  };
  const submitFailDelivery = async () => {
    if (request.reason.trim().length == 0) {
      Alert.alert("Vui lòng thông mô tả tương tứng với lí do đã chọn.");
      return;
    }

    setIsSubmitting(true);
    if (isImageHandling) return;

    if (imageHandleError) {
      setImageHandleError(false);
      setIsSubmitting(false);
      return;
    }
    requestFailDelivery();
  };
  const getActionComponent = (order: OrderFetchModel) => {
    if (
      order.status < OrderStatus.Preparing ||
      order.status > OrderStatus.Delivering
    )
      return <View></View>;
    if (order.status == OrderStatus.Preparing)
      return (
        <View className="mt-3 w-full items-center justify-between bg-white">
          <CustomButton
            title={`Đi giao`}
            handlePress={() => {
              orderUIService.onDelivery(
                order,
                () => {
                  getOrderDetail();
                  globalCompleteDeliveryConfirm.onAfterCompleted();
                },
                () => {
                  setOrder({ ...order, status: OrderStatus.Delivering });
                  getOrderDetail();
                  const toast = Toast.show({
                    type: "success",
                    text1: "Hoàn tất",
                    text2: `MS-${order.id} đã chuyển sang trạng thái giao hàng`,
                  });
                },
                (error) => {
                  getOrderDetail();
                  globalCompleteDeliveryConfirm.onAfterCompleted();
                  Alert.alert(
                    "Oops!",
                    error?.response?.data?.error?.message ||
                      "Yêu cầu bị từ chối, vui lòng thử lại sau!"
                  );
                }
              );
            }}
            containerStyleClasses="w-full h-[42px] px-2 bg-transparent border-2 border-gray-200 bg-[#06b6d4] border-[#22d3ee] font-semibold z-10"
            // iconRight={
            //   <View className="ml-2">
            //     <Ionicons
            //       name="send-outline"
            //       size={14}
            //       color="white"
            //     />
            //   </View>
            // }
            textStyleClasses="text-[14px] text-center text-gray-900 ml-1 text-white"
          />
        </View>
      );
    if (order.status == OrderStatus.Delivering)
      return (
        <View className="mt-3 w-full items-center justify-between bg-white">
          <CustomButton
            title={`Giao thành công`}
            handlePress={() => {
              if (
                utilService.isCurrentTimeGreaterThanEndTime({
                  startTime: order.startTime,
                  endTime: order.endTime,
                  intendedReceiveDate: order.intendedReceiveDate,
                })
              ) {
                getOrderDetail();
                globalCompleteDeliveryConfirm.onAfterCompleted();
                Alert.alert(
                  "Oops!",
                  "Đã quá thời gian để thực hiện thao tác này!"
                );
                return;
              }
              globalCompleteDeliveryConfirm.setStep(1);
            }}
            containerStyleClasses="w-full h-[42px]  px-2 bg-transparent border-2 border-gray-200 bg-[#4ade80] border-[#86efac] font-semibold z-10"
            // iconLeft={
            //   <Ionicons name="filter-outline" size={21} color="white" />
            // }
            textStyleClasses="text-[14px] text-center text-gray-900 ml-1 text-white text-gray-800"
          />
          <CustomButton
            title="Giao thất bại"
            handlePress={() => {
              if (
                utilService.isCurrentTimeGreaterThanEndTime({
                  startTime: order.startTime,
                  endTime: order.endTime,
                  intendedReceiveDate: order.intendedReceiveDate,
                })
              ) {
                getOrderDetail();
                globalCompleteDeliveryConfirm.onAfterCompleted();
                Alert.alert(
                  "Oops!",
                  "Đã quá thời gian để thực hiện thao tác này!"
                );
                return;
              }
              globalCompleteDeliveryConfirm.setStep(2);
            }}
            containerStyleClasses="w-full mt-2 h-[40px] px-2 bg-transparent border-2 border-gray-200 border-[#fecaca] bg-[#fef2f2] font-semibold z-10 ml-1 "
            textStyleClasses="text-[14px] text-center text-gray-900 ml-1 text-white text-gray-700 text-[#f87171]"
          />
        </View>
      );
  };

  const selectActionStep = (
    <View>
      {order?.id &&
        (isOrderDetailViewMode ? (
          <ScrollView
            style={{ maxHeight }}
            refreshControl={
              <RefreshControl
                tintColor={"#FCF450"}
                refreshing={isReloading}
                onRefresh={() => {
                  getOrderDetail();
                }}
              />
            }
          >
            <DeliveryOrderDetail
              // containerStyleClasses="flex-1"
              orderId={globalCompleteDeliveryConfirm.id}
              order={order}
              setOrder={setOrder}
              onNotFound={() => {
                Alert.alert(
                  `Đơn hàng MS-${globalCompleteDeliveryConfirm.id} không tồn tại`,
                  "Vui lòng thử lại!"
                );
                globalOrderDetailPageState.onBeforeBack();
                router.back();
              }}
            />
          </ScrollView>
        ) : (
          <View className="mt-2 bg-white p-2">
            <Text className="text-[15px] text-gray-600 font-semibold">
              Thông tin nhận hàng
            </Text>

            <View className="mt-3 border-gray-300 border-[0.5px]" />
            <View className="py-2">
              <Text className="text-[14px] text-gray-700 font-semibold">
                {order.customer?.fullName}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Số điện thoại", "", [
                    {
                      text: "Gọi " + order.customer?.phoneNumber,
                      onPress: () =>
                        Linking.openURL(`tel:${order.customer?.phoneNumber}`),
                    },
                    {
                      text: "Sao chép",
                      onPress: () =>
                        Clipboard.setString(order.customer?.phoneNumber),
                    },
                    { text: "Hủy", style: "cancel" },
                  ]);
                }}
              >
                <Text className="text-[14px] text-gray-700 font-semibold text-[#0e7490]">
                  {order.customer?.phoneNumber}
                </Text>
              </TouchableOpacity>
              <Text className="text-[14px] text-gray-700 font-semibold italic">
                {order?.buildingName}
              </Text>
            </View>
            <View className="mt-[4px]">
              <View className="flex-row justify-start items-center gap-2">
                <Text className="text-xs italic text-gray-500">
                  Tóm tắt đơn:
                </Text>
                <Text className="flex-1 text-[12px] font-medium me-2 px-1 py-1 rounded">
                  {order.orderDetailSummary}
                </Text>
              </View>
              <View className="flex-row gap-x-1 items-center">
                <Text className="text-xs italic text-gray-500">Tổng tiền:</Text>
                <Text
                  className={`flex-1 text-[14px] text-secondary font-medium me-2 px-2.5 py-1 rounded `}
                >
                  {utilService.formatPrice(
                    order.totalPrice - order.totalPromotion
                  )}{" "}
                  ₫
                </Text>
                <TouchableOpacity
                  onPress={() => {}}
                  className="mt-2 justify-center items-center ml-2 rounded-sm overflow-hidden"
                >
                  <Text
                    className={`text-[11px] font-medium me-2 px-2.5 py-0.5 rounded text-[#227B94]`}
                  >
                    Chi tiết
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="mt-1 border-gray-300 border-[0.3px]" />
            <View className="py-2 ">
              <Text className="text-[14px] text-gray-700">
                Khung nhận hàng:
              </Text>
              <Text className="text-[14px] text-gray-700 font-semibold">
                {dayjs(order.intendedReceiveDate).format("DD/MM/YYYY") +
                  " | " +
                  utilService.formatTime(order.startTime) +
                  " - " +
                  utilService.formatTime(order.endTime)}
              </Text>
            </View>
            {!order.receiveAt && (
              <View className="py-2 ">
                <Text className="text-[14px] text-gray-700">
                  Trạng thái giao hàng
                </Text>
                <Text className="text-[12px] text-gray-700">
                  Đã nhận hàng vào:
                </Text>
                <Text className="text-[12px] text-gray-700 font-semibold">
                  {dayjs(order.receiveAt || new Date())
                    .local()
                    .format("HH:mm DD/MM/YYYY")}
                </Text>
              </View>
            )}
          </View>
        ))}

      {order && getActionComponent(order)}
    </View>
  );
  const confirmSuccessStep = (
    <View className="gap-y-2 py-2">
      <View className="mt-2 bg-gray-200 p-1 items-center justify-center rounded-xl">
        <AreaQRScanner
          innerDimension={280}
          handleQRCode={handleDeliverySuccess}
        />
      </View>
      <Text className="text-[12px] text-center text-green-500 font-semibold">
        Quét mã xác nhận giao thành công
      </Text>
      <TouchableOpacity
        onPress={() => setStep(0)}
        className="flex-row justify-center gap-x-2 p-2 border-[1px] border-gray-200 rounded-lg"
      >
        <Ionicons name="arrow-back-outline" size={14} color="#475569" />
        <Text className="text-[12px] text-center text-gray-600 font-semibold align-center">
          {"Quay lại"}
        </Text>
      </TouchableOpacity>
    </View>
  );
  const failSubmitStep = (
    <View className="gap-y-2 py-2">
      <View className="gap-y-2 mt-1">
        <View>
          <Text className="font-medium mb-1">Lí do</Text>
          <SelectList
            setSelected={(selected: number | string) =>
              setRequest({ ...request, reasonIndentity: Number(selected) })
            }
            data={[
              {
                key: 1,
                value: "Do phía cửa hàng",
              },
              {
                key: 2,
                value: "Do phía khách hàng",
              },
            ]}
            save="key"
            search={false}
            defaultOption={{
              key: 1,
              value: "Do phía cửa hàng",
            }}
          />
        </View>

        <View>
          <Text className="font-medium">Mô tả lí do</Text>
          <TextInput
            className="border border-gray-300 mt-1 rounded p-2 h-16 bg-white"
            placeholder="Nhập lí do..."
            value={request.reason}
            onChangeText={(text) => setRequest({ ...request, reason: text })}
            multiline
            placeholderTextColor="#888"
          />
        </View>
        <EvidencePreviewMultiImagesUpload
          imageHandleError={imageHandleError}
          setImageHandleError={setImageHandleError}
          isImageHandling={isImageHandling}
          setIsImageHandling={setImageHandling}
          maxNumberOfPics={3}
          uris={request.evidences}
          setUris={(uris) => setRequest({ ...request, evidences: uris })}
          imageWidth={80}
        />
      </View>
      <CustomButton
        title="Xác nhận giao hàng thất bại"
        isLoading={isSubmitting}
        containerStyleClasses="mt-5 bg-primary h-[40px]"
        textStyleClasses="text-white text-[14px]"
        handlePress={() => {
          submitFailDelivery();
        }}
      />
      <TouchableOpacity
        onPress={() => setStep(0)}
        className="flex-row justify-center p-2 border-[1px] border-gray-200 rounded-lg"
      >
        <Ionicons name="arrow-back-outline" size={14} color="#475569" />
        <Text className="text-[12px] text-center text-gray-600 font-semibold align-center">
          {"Quay lại"}
        </Text>
      </TouchableOpacity>
    </View>
  );
  const stepComponents = [selectActionStep, confirmSuccessStep, failSubmitStep];
  return (
    <Modal
      isVisible={globalCompleteDeliveryConfirm.isModalVisible}
      onBackdropPress={() =>
        globalCompleteDeliveryConfirm.setIsModalVisible(false)
      }
    >
      <View style={{ zIndex: 100 }} className="justify-center items-center ">
        <View
          className={`w-80 bg-white p-1 rounded-lg p-4 ${containerStyleClasses}`}
        >
          <View className="flex-row items-center justify-between">
            {order && (
              <Text
                className={`flex-1 text-center font-semibold ${titleStyleClasses}`}
              >
                {order.status == OrderStatus.Delivering
                  ? `MS-${order.id} | Xác nhận đơn giao`
                  : `MS-${order.id} | Chi tiết đơn giao`}
              </Text>
            )}

            {/* <TouchableOpacity
              onPress={() => {
                globalCompleteDeliveryConfirm.setIsModalVisible(false);
              }}
            >
              <Ionicons name="close-outline" size={24} color="gray" />
            </TouchableOpacity> */}
          </View>

          <View className="flex-row items-center justify-center">
            <View className="mt-2 justify-center items-center">
              {order != undefined && (
                <Text
                  className={`text-[10px] font-medium me-2 px-2.5 py-0.5 rounded ${
                    getOrderStatusDescription(order.status)?.bgColor
                  }`}
                  style={{
                    backgroundColor: getOrderStatusDescription(order.status)
                      ?.bgColor,
                  }}
                >
                  {getOrderStatusDescription(order.status)?.description}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                setIsOrderDetailViewMode(!isOrderDetailViewMode);
                // globalOrderDetailPageState.setOrder(order);
                // globalCompleteDeliveryConfirm.setIsModalVisible(false);
                // onParentClose();
                // globalOrderDetailPageState.setOnBeforeBack(() => {
                //   onParentOpen();
                //   getOrderDetail();
                //   globalCompleteDeliveryConfirm.setIsModalVisible(true);
                // });
                // router.push("/order/details");
              }}
              className="mt-2 justify-center items-center ml-2 rounded-sm overflow-hidden"
            >
              {order != undefined && authRole == 2 && (
                <Text
                  className={`text-[10px] font-medium me-2 px-2.5 py-0.5 rounded`}
                  style={{
                    backgroundColor: getOrderStatusDescription(order.status)
                      ?.bgColor,
                  }}
                >
                  {!isOrderDetailViewMode
                    ? "Xem chi tiết đơn"
                    : "Rút gọn thông tin"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {stepComponents[step]}
        </View>
      </View>
      <Toast position="bottom" />
    </Modal>
  );
};

export default CompleteDeliveryConfirmModal;
