import useGlobalCompleteDeliveryConfirm from "@/hooks/states/useGlobalCompleteDeliveryConfirm";
import useOrderDetailPageState from "@/hooks/states/useOrderDetailPageState";
import apiClient from "@/services/api-services/api-client";
import orderUIService from "@/services/order-ui-service";
import sessionService from "@/services/session-service";
import utilService from "@/services/util-service";
import { DeliveryFailModel } from "@/types/models/DeliveryInfoModel";
import OrderFetchModel, {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { ShopDeliveryStaff } from "@/types/models/StaffInfoModel";
import ValueResponse from "@/types/responses/ValueReponse";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  Linking,
  Text,
  TextInput,
  View,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import AreaQRScanner from "../common/AreaQRScanner";
import CustomModal from "../common/CustomModal";
import OrderDeliveryInfo from "../common/OrderDeliveryInfo";
import CustomButton from "../custom/CustomButton";
import OrderDeliveryAssign from "../delivery-package/OrderDeliveryAssign";
import EvidencePreviewMultiImagesUpload from "../images/EvidencePreviewMultiImagesUpload";
import DeliveryOrderDetail from "../order/DeliveryOrderDetail";
import Order from "@/app/(tabs)/order";
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
  const [isOpenOrderAssign, setIsOpenOrderAssign] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageHandling, setImageHandling] = useState(false);
  const [imageHandleError, setImageHandleError] = useState<any>(false);
  const globalOrderDetailPageState = useOrderDetailPageState();
  const globalCompleteDeliveryConfirm = useGlobalCompleteDeliveryConfirm();
  const { model: order, setModel: setOrder } = globalCompleteDeliveryConfirm;
  const { step, setStep } = globalCompleteDeliveryConfirm;
  const [authRole, setAuthRole] = useState(0);
  const [inFrameTime, setInFrameTime] = useState(0); // -1 : before 0 : in 1 : after
  const [request, setRequest] = useState<DeliveryFailModel>({
    reason: "",
    reasonIndentity: 1, // 1. Shop 2. Customer
    evidences: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderDetailViewMode, setIsOrderDetailViewMode] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isViewOrderFoodDetail, setIsViewOrderFoodDetail] = useState(false);
  const getOrderDetail = async (isRefetching = false) => {
    setIsLoading(true);
    if (isRefetching) setIsReloading(true);
    try {
      const response = await apiClient.get<ValueResponse<OrderFetchModel>>(
        `shop-owner-staff/order/${globalCompleteDeliveryConfirm.id}`
      );
      setOrder({ ...response.data.value });
    } catch (error: any) {
      // console.log(error);
      globalCompleteDeliveryConfirm.onAfterCompleted();
      globalCompleteDeliveryConfirm.setIsModalVisible(false);
      setIsViewOrderFoodDetail(false);
      Alert.alert(
        "Oops!",
        error?.response?.data?.error?.message ||
          "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      );
      // console.log(error?.response?.data?.error);
      // Alert.alert(
      //   "Oops",
      //   `Không tìm thấy đơn hàng MS-${globalCompleteDeliveryConfirm.id}!`
      // );
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
  };
  const onRefresh = () => {
    getOrderDetail();
    globalCompleteDeliveryConfirm.onAfterCompleted();
  };
  // useEffect(() => {
  //   if (!globalCompleteDeliveryConfirm.isModalVisible) {
  //     setIsOpenOrderAssign(false);
  //     setIsViewOrderFoodDetail(false);
  //     setIsOrderDetailViewMode(false);
  //   }
  // }, [globalCompleteDeliveryConfirm.isModalVisible]);
  // console.log("isOrderDetailViewMode: ", isOrderDetailViewMode);
  useEffect(() => {
    setIsOpenOrderAssign(false);
    if (globalCompleteDeliveryConfirm.isModalVisible) {
      (async () => {
        const roleId = await sessionService.getAuthRole();
        setAuthRole(roleId);
      })();
      setIsOrderDetailViewMode(false);
      setRequest({
        reason: "",
        reasonIndentity: 1, // 1. Shop 2. Customer
        evidences: [],
      });
      setTimeout(() => {
        getOrderDetail(true);
      }, 1500);
      setInFrameTime(
        utilService.getInFrameTime(
          order.startTime,
          order.endTime,
          order.intendedReceiveDate
        )
      );
    }
  }, [globalCompleteDeliveryConfirm.isModalVisible]);
  useFocusEffect(useCallback(() => {}, []));

  const actionInTimeValidation = (justOver = false) => {
    const inTime = utilService.getInFrameTime(
      order.startTime,
      order.endTime,
      order.intendedReceiveDate
    );
    if (inTime > 0) {
      getOrderDetail();
      setInFrameTime(inTime);
      globalCompleteDeliveryConfirm.onAfterCompleted();
      Alert.alert("Oops!", "Đã quá thời gian để thực hiện thao tác này!");
      return false;
    }
    if (!justOver && inTime < 0) {
      getOrderDetail();
      setInFrameTime(inTime);
      globalCompleteDeliveryConfirm.onAfterCompleted();
      Alert.alert("Oops!", "Chưa đến thời gian để thực hiện thao tác này!");
      return false;
    }
    return true;
  };
  const handleDeliverySuccess = async (
    data: string,
    onSuccess: () => void,
    onError: (error: any) => void
  ) => {
    const qrCodeResult: QRCodeResultModel = JSON.parse(data);
    return await apiClient
      .put(
        `shop-owner-staff/order/${globalCompleteDeliveryConfirm.id}/delivered`,
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
        setStep(0);
        globalCompleteDeliveryConfirm.onAfterCompleted();
        return true;
      })
      .catch((error: any) => {
        onError(error);
        return false;
      })
      .finally(() => {
        // setStep(0);
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
        `shop-owner-staff/order/${globalCompleteDeliveryConfirm.id}/delivery-fail`,
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
        globalCompleteDeliveryConfirm.onAfterCompleted();
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
    const toDeliveryButton = (
      <CustomButton
        title={`Đi giao`}
        isLoading={isSubmitting}
        handlePress={() => {
          const inTime = utilService.getInFrameTime(
            order.startTime,
            order.endTime,
            order.intendedReceiveDate
          );
          if (!actionInTimeValidation()) return;

          orderUIService.onDelivery(
            order,
            () => {
              getOrderDetail();
              globalCompleteDeliveryConfirm.onAfterCompleted();
            },
            () => {
              setOrder({ ...order, status: OrderStatus.Delivering });
              getOrderDetail();
              setIsSubmitting(false);
              const toast = Toast.show({
                type: "info",
                text1: "Hoàn tất",
                text2: `MS-${order.id} đã chuyển sang trạng thái giao hàng`,
              });
              globalCompleteDeliveryConfirm.onAfterCompleted();
            },
            (error) => {
              getOrderDetail();
              globalCompleteDeliveryConfirm.onAfterCompleted();
              setIsSubmitting(false);
              Alert.alert(
                "Oops!",
                error?.response?.data?.error?.message ||
                  "Yêu cầu bị từ chối, vui lòng thử lại sau!"
              );
            },
            () => {
              setIsSubmitting(true);
            }
          );
        }}
        containerStyleClasses="w-full mt-2 h-[42px] px-2 bg-transparent border-2 border-gray-200 bg-[#06b6d4] border-[#22d3ee] font-semibold z-10"
        textStyleClasses="text-[14px] text-center text-gray-900 ml-1 text-white"
      />
    );
    const successButton = (
      <CustomButton
        title={`Giao thành công`}
        handlePress={() => {
          if (!actionInTimeValidation()) return;
          globalCompleteDeliveryConfirm.setStep(1);
        }}
        containerStyleClasses="w-full mt-2 h-[42px]  px-2 bg-transparent border-2 border-gray-200 bg-[#4ade80] border-[#86efac] font-semibold z-10"
        textStyleClasses="text-[14px] text-center text-gray-900 ml-1 text-white text-gray-800"
      />
    );
    const failDeliveryButton = (
      <CustomButton
        title="Giao thất bại"
        handlePress={() => {
          if (!actionInTimeValidation()) return;
          globalCompleteDeliveryConfirm.setStep(2);
        }}
        containerStyleClasses="w-full mt-2 h-[40px] px-2 bg-transparent border-2 border-gray-200 border-[#fecaca] bg-[#fef2f2] font-semibold z-10 "
        textStyleClasses="text-[14px] text-center text-gray-900 ml-1 text-white text-gray-700 text-[#f87171]"
      />
    );
    const assignButton = (
      <CustomButton
        title={
          order.shopDeliveryStaff == null
            ? `Phân công giao hàng`
            : `Thay đổi phân công`
        }
        handlePress={() => {
          if (!actionInTimeValidation(true)) return;
          setIsOpenOrderAssign(true);
        }}
        containerStyleClasses={`w-full mt-2 h-[42px] px-2 bg-transparent border-2 border-gray-200 bg-[#06b6d4] border-[#22d3ee] font-semibold z-10 ${
          order.shopDeliveryStaff != null && "bg-white"
        }`}
        textStyleClasses={`text-[14px] text-center text-gray-900 ml-1 text-white${
          order.shopDeliveryStaff != null && " text-[#06b6d4]"
        }`}
      />
    );
    if (authRole == 2) {
      return (
        <View className=" w-full bg-white">
          {order.status == OrderStatus.Preparing &&
            inFrameTime == 0 &&
            order.shopDeliveryStaff?.id == 0 &&
            toDeliveryButton}
          {order.status == OrderStatus.Preparing &&
            order.shopDeliveryStaff == null &&
            assignButton}
          {order.status == OrderStatus.Delivering &&
            order.shopDeliveryStaff?.id == 0 &&
            successButton}
          {order.status == OrderStatus.Delivering && failDeliveryButton}
        </View>
      );
    }
    return (
      <View className=" w-full bg-white">
        {order.status == OrderStatus.Preparing &&
          inFrameTime == 0 &&
          toDeliveryButton}

        {order.status == OrderStatus.Delivering && successButton}
        {order.status == OrderStatus.Delivering && failDeliveryButton}
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
            <View className="mt-[4px] pb-1 border-b-[1px] border-gray-200">
              <View className="flex-row justify-start items-center gap-2">
                <Text className="text-xs italic text-gray-500">
                  Tóm tắt đơn:
                </Text>
                <Text
                  className="flex-1 text-[12px] font-medium me-2 px-1 py-1 rounded"
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  {order.orderDetailSummary}
                </Text>
              </View>
              <View className="flex-row gap-x-1 items-center">
                <Text className="text-xs italic text-gray-500">Tổng tiền:</Text>
                <Text
                  className={`flex-1 text-[17px] text-secondary font-medium me-2 px-2.5 py-1 rounded `}
                >
                  {utilService.formatPrice(
                    order.totalPrice - order.totalPromotion
                  )}{" "}
                  ₫
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsViewOrderFoodDetail(true);
                  }}
                  className="mt-2 justify-center items-center ml-2 rounded-sm overflow-hidden"
                >
                  <Text
                    className={`text-[14px] font-medium me-2 px-2.5 py-0.5 rounded text-[#227B94]`}
                  >
                    Chi tiết
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* <View className="mt-2 border-gray-300 border-[0.4px]" /> */}
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
            <OrderDeliveryInfo
              order={order}
              containerStyleClasses={"py-2 bg-blue-100 p-2 mx-[-8px] "}
              assignNode={
                order.shopDeliveryStaff != null &&
                globalCompleteDeliveryConfirm.isShowActionale &&
                order.status <= OrderStatus.Delivering &&
                authRole == 2 &&
                inFrameTime == 0 ? (
                  <TouchableOpacity
                    onPress={() => {
                      if (!actionInTimeValidation(true)) return;
                      setIsOpenOrderAssign(true);
                    }}
                  >
                    <Text className="p-[0.5] my-[-1] text-[11px] font-medium text-[#0891b2]">
                      Thay đổi
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View></View>
                )
              }
            />
          </View>
        ))}

      {order.id != undefined &&
        globalCompleteDeliveryConfirm.isShowActionale &&
        getActionComponent(order)}
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
        <TouchableWithoutFeedback
          onPress={() => Keyboard.dismiss()}
          className="gap-y-2"
        >
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
        </TouchableWithoutFeedback>
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
      backdropOpacity={0.25}
      onBackdropPress={() => {
        globalCompleteDeliveryConfirm.setIsModalVisible(false);
        // globalCompleteDeliveryConfirm.onAfterCompleted();
      }}
    >
      <View
        // onTouchEnd={() => Keyboard.dismiss()}
        style={{ zIndex: 100 }}
        className="justify-center items-center "
      >
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
      {order.id != undefined && (
        <CustomModal
          title={`MS-${order.id} | Chi tiết đặt món`}
          hasHeader={false}
          isOpen={isViewOrderFoodDetail}
          setIsOpen={(value) => setIsViewOrderFoodDetail(value)}
          titleStyleClasses="text-center flex-1 text-[14px] text-gray-600 font-semibold"
          containerStyleClasses="w-72"
          onBackdropPress={() => {
            setIsViewOrderFoodDetail(false);
          }}
        >
          <View className="bg-white p-2">
            <Text className="text-[14px] text-gray-600 font-semibold text-center mt-[-8px]">
              {`MS-${order.id} | Chi tiết đặt món`}
            </Text>
            <View className="mt-3 border-gray-300 border-[0.5px]" />
            <View className="pt-4 gap-y-2">
              {order.orderDetails.map((detail) => (
                <View key={detail.id}>
                  <View className="flex-row justify-between">
                    <View className="flex-row gap-x-2">
                      <Text className="font-semibold ">{detail.name}</Text>
                      <Text className="font-semibold w-[28px]">
                        x{detail.quantity}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-semibold">
                        {utilService.formatPrice(detail.totalPrice)}₫
                      </Text>
                    </View>
                  </View>

                  {detail.optionGroups.length > 0 && (
                    <View className="flex-row gap-x-2">
                      <Text className="w-[28px]"></Text>
                      {detail.optionGroups.map((option) => (
                        <Text
                          className="italic font-gray-500 text-[12px]"
                          key={detail.id + option.optionGroupTitle}
                        >
                          {option.optionGroupTitle}:{" "}
                          {option.options
                            .map((item) => item.optionTitle)
                            .join(", ")}
                          {" ; "}
                        </Text>
                      ))}
                    </View>
                  )}

                  {detail.note && (
                    <View className="flex-row gap-x-2 mt-[2px]">
                      <Text className="italic font-gray-500 text-[13.2px]">
                        Ghi chú: {detail.note}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
          <View className="mt-1 bg-white p-2">
            <Text className="text-[14px] text-gray-500 font-medium italic">
              Ghi chú cho toàn đơn hàng
            </Text>
            <View className="mt-2 border-gray-300 border-[0.5px]" />
            <Text className="mt-2 italic text-gray-5\600  text-[14px]">
              {order.note || "Không có"}
            </Text>
          </View>
        </CustomModal>
      )}
      <CustomModal
        title={``}
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
          onComplete={(shopDeliveryStaff: ShopDeliveryStaff) => {
            Toast.show({
              type: "info",
              text1: "Hoàn tất",
              text2: `Đơn hàng MS-${order.id} sẽ được giao bởi ${
                shopDeliveryStaff.id == 0 ? "bạn" : shopDeliveryStaff.fullName
              }!`,
              // time: 15000
            });
            setIsOpenOrderAssign(false);
            onRefresh();
          }}
          order={order}
          isNeedForReconfimation={order.shopDeliveryStaff ? false : true}
        />
      </CustomModal>
      <Toast position="bottom" />
    </Modal>
  );
};

export default CompleteDeliveryConfirmModal;
