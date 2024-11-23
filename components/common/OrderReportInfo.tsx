import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import apiClient from "@/services/api-services/api-client";
import utilService from "@/services/util-service";
import { OrderDeliveryInfoModel } from "@/types/models/DeliveryInfoModel";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import {
  FetchOnlyListResponse,
  FetchValueResponse,
} from "@/types/responses/FetchResponse";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import React, { ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewingModal from "../target-modals/ImageViewingModal";
import CustomModal from "./CustomModal";
import FailDeliveryUpdate from "./FailDeliveryUpdate";
import { ReportGetModel } from "@/types/models/ReportModel";
import { Avatar } from "react-native-paper";

const OrderReportInfo = ({
  order,
  containerStyleClasses = "py-2 bg-blue-100 p-2 mx-[-8px] ",
  textNameStyleClasses = `text-[13.5px]`,
  avatarStyleClasses = `h-[17px] w-[17px] mr-[2px]`,
  isLoading,
}: {
  order: OrderFetchModel;
  containerStyleClasses?: string;

  textNameStyleClasses?: string;
  avatarStyleClasses?: string;
  isLoading: boolean;
}) => {
  const globalAuthState = useGlobalAuthState();
  const globalImageViewState = useGlobalImageViewingState();
  const [isEditable, setIsEditable] = useState(true);
  const [isReplyReport, setIsReplyReport] = useState(false);

  const reportsFetcher = useFetchWithRQWithFetchFunc(
    [`shop-owner/order/report/${order.id}`],
    async (): Promise<FetchOnlyListResponse<ReportGetModel>> =>
      apiClient
        .get(`shop-owner/order/report/${order.id}`)
        .then((response) => response.data),
    []
  );
  const getIsInTimeForReply = () => {
    const endFrameDate = dayjs(
      dayjs(order.intendedReceiveDate)
        .local()
        .set("hour", Math.floor(order.endTime / 100))
        .set("minute", order.endTime % 100)
        .toDate()
    ).add(22, "hours"); // 12h-22h to reply
    return new Date() < endFrameDate.toDate();
  };
  useEffect(() => {
    if (!reportsFetcher.isFetching) reportsFetcher.refetch();
  }, [order]);
  useFocusEffect(
    React.useCallback(() => {
      reportsFetcher.refetch();
      setIsEditable(getIsInTimeForReply());
    }, [])
  );

  // console.log("fetch.data?.value: ", fetch.data?.value);
  const getOrderReportInfo = () => {
    if (!reportsFetcher.data?.value) return null;
    const report = reportsFetcher.data.value.at(0);
    const reply = reportsFetcher.data.value.at(1);

    return (
      <View>
        <View className="flex-row items-center justify-between ">
          {/* <Text className="text-[14px] font-semibold text-gray-700">
        Trạng thái giao hàng
      </Text> */}
          <Text
            className={`text-[9px] font-medium me-2 px-2.5 py-0.5 rounded bg-red-400 `}
          >
            Báo cáo từ ${report?.customerInfo.fullName}
          </Text>
        </View>
        <View className="p-1 bg-[#fff7ed] rounded-md mt-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 font-medium">{report?.title}</Text>
            {isEditable && !reply && (
              <TouchableOpacity
                onPress={() => {
                  if (!getIsInTimeForReply()) {
                    setIsEditable(false);
                    Alert.alert(
                      "Oops!",
                      "Đã quá thời gian để thực hiện thao tác này!"
                    );
                    return;
                  }
                  setIsReplyReport(true);
                }}
                className="justify-center items-center ml-2 mr-2 rounded-sm overflow-hidden"
              >
                <Text className={`text-[12px] font-medium  text-[#227B94]`}>
                  Trả lời
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text className="mt-1 text-gray-600 text-[12.8px]">
            {report?.content}
          </Text>
          {report && report.imageUrls.length > 0 && (
            <View className="flex-row gap-x-2 mt-1">
              {report.imageUrls
                .map((imageUrl) => ({
                  imageUrl,
                  takePictureDateTime: report.createdDate,
                }))
                .map((evidence) => (
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
          {/* <Text className="mt-1 text-[12px] mt-2 text-gray-700">
          Cập nhật lần cuối:{" "}
          <Text className="italic">
            {dayjs(report?.createdDate)
              .local()
              .format("HH:mm DD/MM/YYYY")}
          </Text>
        </Text> */}
        </View>
        {reply && (
          <View className="py-2 pl-4 mr-[-14px] bg-[#fefce8] rounded-md">
            <View className="flex-row gap-x-4 items-center">
              {/* <View className="w-[36px] justify-center items-center border-[1px] border-green-200 rounded-full">
              <Avatar.Image
                size={34}
                source={{
                  uri:
                    review.reviews[1].avatar || CONSTANTS.url.userAvatarDefault,
                }}
              />
            </View> */}
              <View>
                <Text className="text-gray-800">Phản hồi từ cửa hàng</Text>
                <Text className="text-gray-600 mt-1 text-[12px]">
                  {dayjs(reply.createdDate).local().format("HH:mm DD/MM/YYYY")}
                </Text>
              </View>
            </View>
            <Text className="mt-2 italic text-gray-800">{reply.content}</Text>
            {reply.imageUrls.length > 0 && (
              <View className="flex-row gap-x-2 mt-1">
                {reply.imageUrls
                  .map((imageUrl) => ({
                    imageUrl,
                    takePictureDateTime: reply.createdDate,
                  }))
                  .map((evidence) => (
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
          </View>
        )}
      </View>
    );
  };
  if (reportsFetcher.isFetching) {
    return (
      <View className="mt-2 bg-white p-2 items-center justify-center">
        <ActivityIndicator animating={true} color="#FCF450" />
      </View>
    );
  }
  if (reportsFetcher.isError) {
    // console.error(reportsFetcher.error);
    return null;
  }

  return (
    <View className="mt-2 bg-white p-2">
      <View className={`rounded-md ${containerStyleClasses}`}>
        {getOrderReportInfo()}
        <ImageViewingModal />
        {isEditable && (
          <CustomModal
            title={``}
            hasHeader={false}
            isOpen={isReplyReport}
            setIsOpen={(value) => setIsReplyReport(value)}
            titleStyleClasses="text-center flex-1"
            containerStyleClasses="w-[98%]"
            onBackdropPress={() => {
              setIsReplyReport(false);
            }}
          >
            <View></View>
          </CustomModal>
        )}
      </View>
    </View>
  );
};

export default OrderReportInfo;
