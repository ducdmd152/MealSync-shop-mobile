import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { ReactNode, useEffect, useState } from "react";
import OrderFetchModel, {
  getOrderStatusDescription,
  OrderStatus,
} from "@/types/models/OrderFetchModel";
import { Image } from "react-native";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import apiClient from "@/services/api-services/api-client";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { OrderDeliveryInfoModel } from "@/types/models/DeliveryInfoModel";
import dayjs from "dayjs";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import ImageViewingModal from "../target-modals/ImageViewingModal";
import { useFocusEffect } from "expo-router";
import CustomModal from "./CustomModal";
import FailDeliveryUpdate from "./FailDeliveryUpdate";
import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
import utilService from "@/services/util-service";

const OrderDeliveryInfo = ({
  order,
  containerStyleClasses = "",
  textNameStyleClasses = "",
  avatarStyleClasses = "",
  assignNode,
}: {
  order: OrderFetchModel;
  containerStyleClasses?: string;
  assignNode: ReactNode;
  textNameStyleClasses?: string;
  avatarStyleClasses?: string;
}) => {
  const globalAuthState = useGlobalAuthState();

  const globalImageViewState = useGlobalImageViewingState();
  const [isEditable, setIsEditable] = useState(true);
  const [isUpdateFailDelivery, setIsUpdateFailDelivery] = useState(false);

  const fetch = useFetchWithRQWithFetchFunc(
    [`shop-owner-staff/order/${order.id}/delivery-infor`],
    async (): Promise<FetchValueResponse<OrderDeliveryInfoModel>> =>
      apiClient
        .get(`shop-owner-staff/order/${order.id}/delivery-infor`)
        .then((response) => response.data),
    []
  );
  useFocusEffect(
    React.useCallback(() => {
      fetch.refetch();
      const endFrameDate = dayjs(
        dayjs(order.intendedReceiveDate)
          .local()
          .set("hour", Math.floor(order.endTime / 100))
          .set("minute", order.endTime % 100)
          .toDate()
      ).add(2, "hours");

      setIsEditable(!(new Date() > endFrameDate.toDate()));
    }, [])
  );

  // console.log("fetch.data?.value: ", fetch.data?.value);
  const getOrderDeliveryInfo = () => {
    const info = fetch.data?.value;
    if (info?.deliveryStatus == 1)
      return (
        <View>
          <View className="flex-row items-center justify-between ">
            {/* <Text className="text-[12px] font-semibold text-gray-700">
              Trạng thái giao hàng
            </Text> */}
            <Text
              className={`text-[9px] font-medium me-2 px-2.5 py-0.5 rounded bg-green-400 `}
            >
              Giao hàng thành công
            </Text>
            <Text
              className={`text-[11px] me-2 py-1 text-right italic text-gray-500 `}
            >
              {dayjs(info?.receiveAt).local().format("HH:mm DD/MM/YYYY")}
            </Text>
          </View>
        </View>
      );
    if (info?.deliveryStatus == 2)
      return (
        <View>
          <View className="flex-row items-center justify-between ">
            {/* <Text className="text-[14px] font-semibold text-gray-700">
              Trạng thái giao hàng
            </Text> */}
            <Text
              className={`text-[9px] font-medium me-2 px-2.5 py-0.5 rounded bg-red-400 `}
            >
              Giao hàng thất bại
            </Text>
          </View>
          <View className="p-1 bg-[#fff7ed] rounded-md mt-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 font-medium">
                {/* Lí do: <Text className="italic"></Text> */}
                {info?.deliveryFaileEvidence.reasonIndentity
                  ? "Do phía cửa hàng"
                  : "Do phía khách hàng"}
              </Text>
              {isEditable && (
                <TouchableOpacity
                  onPress={() => {
                    const endFrameDate = dayjs(
                      dayjs(order.intendedReceiveDate)
                        .local()
                        .set("hour", Math.floor(order.endTime / 100))
                        .set("minute", order.endTime % 100)
                        .toDate()
                    ).add(2, "hours");
                    if (new Date() > endFrameDate.toDate()) {
                      setIsEditable(false);
                      Alert.alert(
                        "Oops!",
                        "Đã quá thời gian để thực hiện thao tác này!"
                      );
                      return;
                    }
                    setIsUpdateFailDelivery(true);
                  }}
                  className="justify-center items-center ml-2 mr-2 rounded-sm overflow-hidden"
                >
                  <Text className={`text-[12px] font-medium  text-[#227B94]`}>
                    Chỉnh sửa
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text className="mt-1 text-gray-600 text-[12.8px]">
              Mô tả:{" "}
              <Text className="italic">
                {info?.deliveryFaileEvidence.reason || "Không có mô tả"}
              </Text>
            </Text>
            {info?.deliveryFaileEvidence.evidences.length > 0 && (
              <View className="flex-row gap-x-2 mt-1">
                {info?.deliveryFaileEvidence.evidences.map((evidence) => (
                  <TouchableOpacity
                    key={evidence.imageUrl}
                    onPress={() => {
                      globalImageViewState.setUrl(evidence.imageUrl);
                      globalImageViewState.setDescription(
                        "Cập nhật vào " +
                          dayjs(evidence.takePictureDateTime).format(
                            "HH:mm DD/MM/YYYY"
                          )
                      );
                      globalImageViewState.setIsModalVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: evidence.imageUrl }}
                      className="w-[40px] h-[40px] rounded-md"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text className="mt-1 text-[12px] mt-2 text-gray-700">
              Cập nhật lần cuối:{" "}
              <Text className="italic">
                {dayjs(info?.lastestDeliveryFailAt)
                  .local()
                  .format("HH:mm DD/MM/YYYY")}
              </Text>
            </Text>
          </View>
        </View>
      );
    //     <Text
    //     className={`text-[10px] font-medium me-2 px-2.5 py-0.5 rounded`}
    //     style={{
    //       backgroundColor: getOrderStatusDescription(
    //         fetch.data?.value.deliveryStatus == 1
    //           ? OrderStatus.Delivered
    //           : fetch.data?.value.deliveryStatus == 2
    //           ? OrderStatus.FailDelivery
    //           : order.status == OrderStatus.Preparing ||
    //             order.status == OrderStatus.Delivered
    //           ? order.status
    //           : OrderStatus.Pending
    //       )?.bgColor,
    //     }}
    //   >

    //     {getOrderStatusDescription(order.status)?.description}
    //   </Text>
  };
  return (
    <View
      className={`rounded-md ${containerStyleClasses} ${
        fetch.data?.value.deliveryStatus == 1 && "bg-green-100"
      } ${fetch.data?.value.deliveryStatus == 2 && "bg-[#fef2f2]"}`}
    >
      {getOrderDeliveryInfo()}
      {order.shopDeliveryStaff && (
        <View className="items-start">
          <View className="flex-row items-center my-1 gap-x-2 py-2">
            <Text className="text-gray-500 text-[11px]">Người giao:</Text>
            <Image
              source={{ uri: order.shopDeliveryStaff.avatarUrl }}
              resizeMode="cover"
              className={`h-[14px] w-[14px] rounded-full opacity-85 ${avatarStyleClasses}`}
            />
            <Text className={`text-[11px] flex-1 ${textNameStyleClasses}`}>
              {utilService.shortenName(order.shopDeliveryStaff.fullName)}
              {(order.shopDeliveryStaff.id == 0 ||
                globalAuthState.roleId != 2) &&
                " (bạn)"}
            </Text>
            {assignNode}
          </View>
        </View>
      )}
      <ImageViewingModal />
      {fetch?.data?.value.deliveryStatus == 2 && (
        <CustomModal
          title={`MS-${order.id} Chi tiết đặt hàng`}
          hasHeader={false}
          isOpen={isUpdateFailDelivery}
          setIsOpen={(value) => setIsUpdateFailDelivery(value)}
          titleStyleClasses="text-center flex-1"
          containerStyleClasses="w-[98%]"
          onBackdropPress={() => {
            setIsUpdateFailDelivery(false);
          }}
        >
          <FailDeliveryUpdate
            order={order}
            failDeliveryInfo={fetch?.data?.value}
            afterCompleted={() => {
              fetch.refetch();
              setIsUpdateFailDelivery(false);
            }}
            cancel={() => setIsUpdateFailDelivery(false)}
          />
        </CustomModal>
      )}
    </View>
  );
};

export default OrderDeliveryInfo;
