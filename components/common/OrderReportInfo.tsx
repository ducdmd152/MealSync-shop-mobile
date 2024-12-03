import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import apiClient from "@/services/api-services/api-client";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import { ReportGetModel, ReportStatus } from "@/types/models/ReportModel";
import { FetchOnlyListResponse } from "@/types/responses/FetchResponse";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReportReplyModal from "../target-modals/ReportReplyModal";
const STATUSES = [
  {
    value: ReportStatus.Pending,
    description: "Đang xử lí",
    bgColor: "#fde68a",
  },
  {
    value: ReportStatus.Approved,
    description: "Báo cáo được chấp nhận",
    bgColor: "#c7d2fe",
  },
  {
    value: ReportStatus.Rejected,
    description: "Báo cáo bị từ chối",
    bgColor: "#e7e5e4",
  },
];
const OrderReportInfo = ({
  order,
  containerStyleClasses = "py-2 bg-[#ffedd5] p-2 mx-[-8px] ",
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
    [`shop-owner/order/${order.id}/report`],
    async (): Promise<FetchOnlyListResponse<ReportGetModel>> =>
      apiClient
        .get(`shop-owner/order/${order.id}/report`)
        .then((response) => response.data),
    [],
  );
  const getIsInTimeForReply = () => {
    const endFrameDate = dayjs(
      dayjs(order.intendedReceiveDate)
        .local()
        .set("hour", Math.floor(order.endTime / 100))
        .set("minute", order.endTime % 100)
        .toDate(),
    ).add(22, "hours"); // 12h-22h to reply
    return new Date() < endFrameDate.toDate();
  };
  useEffect(() => {
    if (isLoading && !reportsFetcher.isFetching) reportsFetcher.refetch();
  }, [isLoading]);
  useFocusEffect(
    React.useCallback(() => {
      reportsFetcher.refetch();
      setIsEditable(getIsInTimeForReply());
    }, []),
  );

  // console.log("fetch.data?.value: ", fetch.data?.value);
  const getOrderReportInfo = () => {
    if (!reportsFetcher.data?.value) return null;
    const report = reportsFetcher.data.value.at(0);
    const reply = reportsFetcher.data.value.at(1);

    return (
      <View>
        <View className="flex-row items-start justify-between ">
          {/* <Text className="text-[14px] font-semibold text-gray-700">
        Trạng thái giao hàng
      </Text> */}
          <View>
            <Text className={`text-[12px] font-medium me-2  py-0.5 rounded  `}>
              Báo cáo từ {report?.customerInfo.fullName}
            </Text>
            <Text className="text-gray-600 text-[11px] italic mr-1">
              {dayjs(report?.createdDate).local().format("HH:mm DD/MM/YYYY")}
            </Text>
          </View>

          <Text
            className={`text-[11px] font-medium me-2 px-2.5 py-[2px] rounded`}
            style={{
              backgroundColor: STATUSES.find(
                (item) => item.value == report?.status,
              )?.bgColor,
            }}
          >
            {STATUSES.find((item) => item.value == report?.status)?.description}
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
                      "Đã quá thời gian để thực hiện thao tác này!",
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
                            "HH:mm DD/MM/YYYY",
                          ),
                      );
                      globalImageViewState.setIsModalVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: evidence.imageUrl }}
                      className="w-[52px] h-[52px] rounded-md"
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
          <View className="py-2 pl-4 mr-[-14px]  rounded-md">
            <View className="flex-row gap-x-4 items-center justify-between">
              <Text className="text-gray-800 text-[12.9px] font-bold">
                Phản hồi từ cửa hàng
              </Text>
              <Text className="text-gray-600 text-[12px] mr-6">
                {dayjs(reply.createdDate).local().format("HH:mm DD/MM/YYYY")}
              </Text>
            </View>
            <Text className="my-1 italic text-gray-800">{reply.content}</Text>
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
                              "HH:mm DD/MM/YYYY",
                            ),
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
        {isEditable && reportsFetcher.data?.value?.at(0) && (
          <ReportReplyModal
            orderId={order.id}
            reportId={reportsFetcher.data?.value?.at(0)?.id || 0}
            isOpen={isReplyReport}
            setIsOpen={(value) => setIsReplyReport(value)}
            onAfterCompleted={() => reportsFetcher.refetch()}
          />
        )}
      </View>
    </View>
  );
};

export default OrderReportInfo;
