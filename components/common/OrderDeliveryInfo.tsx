import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
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
import useGlobalCompleteDeliveryConfirm from "@/hooks/states/useGlobalCompleteDeliveryConfirm";
import CompleteDeliveryConfirmModal from "../target-modals/CompleteDeliveryConfirmModal";

const OrderDeliveryInfo = ({
  order,
  containerStyleClasses = "",
}: {
  order: OrderFetchModel;
  containerStyleClasses?: string;
}) => {
  const globalImageViewState = useGlobalImageViewingState();
  const globalCompleteDeliveryConfirm = useGlobalCompleteDeliveryConfirm();

  const [isEditable, setIsEditable] = useState(true);
  const fetch = useFetchWithRQWithFetchFunc(
    [`shop-owner/order/${order.id}/delivery-infor`],
    async (): Promise<FetchValueResponse<OrderDeliveryInfoModel>> =>
      apiClient
        .get(`shop-owner/order/${order.id}/delivery-infor`)
        .then((response) => response.data),
    []
  );
  useEffect(() => {
    fetch.refetch();
    const endFrameDate = dayjs(
      dayjs(order.intendedReceiveDate)
        .local()
        .set("hour", Math.floor(order.endTime / 100))
        .set("minute", order.endTime % 100)
        .toDate()
    ).add(2, "hours");
    setIsEditable(new Date() > endFrameDate.toDate());
  }, [order.id]);

  console.log("fetch.data?.value: ", fetch.data?.value);
  const getOrderDeliveryInfo = () => {
    const info = fetch.data?.value;
    if (info?.deliveryStatus == 1)
      return (
        <View>
          <View className="flex-row items-center justify-between ">
            <Text className="text-[14px] font-semibold text-gray-700">
              Trạng thái giao hàng
            </Text>
            <Text
              className={`text-[9px] font-medium me-2 px-2.5 py-0.5 rounded bg-green-400 `}
            >
              Giao hàng thành công
            </Text>
          </View>
          <Text
            className={`text-[10px] me-2 py-1 text-right italic text-gray-500 `}
          >
            Đã giao: {dayjs(info?.receiveAt).local().format("HH:mm DD/MM/YYYY")}
          </Text>
        </View>
      );
    if (info?.deliveryStatus == 2)
      return (
        <View>
          <View className="flex-row items-center justify-between ">
            <Text className="text-[14px] font-semibold text-gray-700">
              Trạng thái giao hàng
            </Text>
            <Text
              className={`text-[9px] font-medium me-2 px-2.5 py-0.5 rounded bg-red-400 `}
            >
              Giao hàng thất bại
            </Text>
          </View>
          <View className="p-1 bg-gray-200 rounded-md mt-1">
            <View>
              <Text className="text-gray-700 font-medium">
                {/* Lí do: <Text className="italic"></Text> */}
                {info?.deliveryFaileEvidence.reasonIndentity
                  ? "Do phía cửa hàng"
                  : "Do phía khách hàng"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  //   const endFrameDate = dayjs(
                  //     dayjs(order.intendedReceiveDate)
                  //       .local()
                  //       .set("hour", Math.floor(order.endTime / 100))
                  //       .set("minute", order.endTime % 100)
                  //       .toDate()
                  //   ).add(2, "hours");
                  //   if (new Date() > endFrameDate.toDate()) {
                  //     setIsEditable(false);
                  //     Alert.alert(
                  //       "Oops!",
                  //       "Đã quá thời gian để thực hiện thao tác này!"
                  //     );
                  //     return;
                  //   }
                  globalCompleteDeliveryConfirm.setIsShowActionale(true);
                  globalCompleteDeliveryConfirm.setId(order.id);
                  globalCompleteDeliveryConfirm.setOnAfterCompleted(() => {
                    // fetch.refetch()
                  });
                  globalCompleteDeliveryConfirm.setIsModalVisible(true);
                  globalCompleteDeliveryConfirm.setModel(order);
                  globalCompleteDeliveryConfirm.setStep(0);
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
            <Text className="mt-1 text-gray-700">
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
      } ${fetch.data?.value.deliveryStatus == 2 && "bg-red-100"}`}
    >
      {getOrderDeliveryInfo()}
      {order.shopDeliveryStaff && (
        <View className="items-start">
          <View className="flex-row items-center my-1 gap-x-2 py-2">
            <Text className="text-gray-500 text-[11px]">Người giao:</Text>
            <Image
              source={{ uri: order.shopDeliveryStaff.avatarUrl }}
              resizeMode="cover"
              className="h-[15px] w-[15px] rounded-md opacity-85"
            />
            <Text className="text-[13.5px]">
              {order.shopDeliveryStaff.fullName}
              {order.shopDeliveryStaff.id == 0 && " (bạn)"}
            </Text>
          </View>
        </View>
      )}
      <ImageViewingModal />
      <CompleteDeliveryConfirmModal />
    </View>
  );
};

export default OrderDeliveryInfo;
