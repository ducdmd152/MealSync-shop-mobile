import CONSTANTS from "@/constants/data";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import useGlobalReviewReplyState from "@/hooks/states/useGlobalReviewReplyState";
import apiClient from "@/services/api-services/api-client";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import dayjs from "dayjs";
import { useFocusEffect } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "react-native-paper";
import { Rating } from "react-native-ratings";
const formatCreatedDate = (createdDate: string): string => {
  const date = dayjs(createdDate);
  const now = dayjs();
  const daysDiff = dayjs(now.local().format("YYYY-MM-DD")).diff(
    dayjs(date.local().format("YYYY-MM-DD")).local(),
    "day"
  );
  if (daysDiff < 1) {
    return date.local().format("HH:mm") + " hôm nay";
  } else if (daysDiff === 1) {
    return date.local().format("HH:mm") + " hôm qua";
  } else if (daysDiff <= 30) {
    return `${daysDiff} ngày trước`;
  } else {
    return date.local().format("YYYY-MM-DD HH:mm");
  }
};
const isOver24Hours = (createdDate: string) => {
  const now = dayjs();
  const reviewDate = dayjs(createdDate);
  // console.log(now, createdDate, now.diff(reviewDate, "hour"));
  return now.diff(reviewDate, "hour") >= 24;
};
const OrderReviewInfo = ({
  order,
  containerStyleClasses = "py-2 bg-[#ecfeff] p-2 mx-[-8px] ",
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
  const globalImageViewState = useGlobalImageViewingState();
  const globalReviewReplyState = useGlobalReviewReplyState();

  const reviewFetcher = useFetchWithRQWithFetchFunc(
    [`shop-onwer/review/order/${order.id}`],
    async (): Promise<FetchValueResponse<ReviewModel[]>> =>
      apiClient
        .get(`shop-onwer/review/order/${order.id}`)
        .then((response) => response.data),
    []
  );

  useEffect(() => {
    if (isLoading && !reviewFetcher.isFetching) reviewFetcher.refetch();
  }, [isLoading]);
  useFocusEffect(
    React.useCallback(() => {
      reviewFetcher.refetch();
    }, [])
  );

  // console.log("fetch.data?.value: ", fetch.data?.value);
  const getOrderReviewInfo = () => {
    if (!reviewFetcher.data?.value) return null;
    const review = reviewFetcher.data.value[0];
    console.log("review: ", JSON.stringify(review));
    // return null;
    return (
      <View className="p-4 py-1">
        <View>
          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row gap-x-4 items-center">
              {/* <View className="w-[36px] justify-center items-center border-[1px] border-green-200 rounded-full">
                <Avatar.Image
                  size={34}
                  source={{
                    uri:
                      review.reviews[0].avatar ||
                      CONSTANTS.url.userAvatarDefault,
                  }}
                />
              </View> */}
              <Text className="text-gray-800 text-[11px] font-semibold">
                {review.reviews[0].name} đã đánh giá
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center ml-[2px] mt-2">
            <View className="flex-row justify-start items-center gap-x-2">
              <Rating
                showRating={false}
                readonly={true}
                startingValue={review.reviews[0].rating}
                imageSize={14}
                tintColor="#ecfeff"
              />
              <Text className="font-bold">&#183;</Text>
              <Text className="text-gray-600 text-[12px]">
                {formatCreatedDate(review.reviews[0].createdDate)}
              </Text>
            </View>
            <View>
              {review.isAllowShopReply &&
                !isOver24Hours(review.reviews[0].createdDate) && (
                  <TouchableOpacity
                    onPress={() => {
                      globalReviewReplyState.setId(review.orderId);
                      globalReviewReplyState.setIsModalVisible(true);
                      globalReviewReplyState.setOnAfterCompleted(() => {
                        reviewFetcher.refetch();
                      });
                    }}
                  >
                    <Text className="ml-2 text-[#3b82f6] font-semibold text-[12px]">
                      Trả lời
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
          <Text className="mt-1 text-gray-800">
            {review.reviews[0].comment}
          </Text>
          {review.reviews[0].imageUrls.length > 0 && (
            <View className="flex-row gap-x-2 mt-1">
              {review.reviews[0].imageUrls.map((imageUrl) => (
                <TouchableOpacity
                  key={imageUrl}
                  onPress={() => {
                    globalImageViewState.setUrl(imageUrl);
                    globalImageViewState.setDescription("");

                    globalImageViewState.setIsModalVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-[90px] h-[90px] rounded-md"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {review.reviews.length > 1 && (
          <View className="py-2 pl-4 mr-[-14px] bg-[#dbeafe] mt-2 rounded-md">
            <View className="flex-row gap-x-4 items-center">
              {/* <View className="w-[36px] justify-center items-center border-[1px] border-green-200 rounded-full">
                <Avatar.Image
                  size={34}
                  source={{
                    uri:
                      review.reviews[1].avatar ||
                      CONSTANTS.url.userAvatarDefault,
                  }}
                />
              </View> */}
              <View>
                <Text className="text-gray-800 text-[11px] font-semibold">
                  Phản hồi từ cửa hàng
                </Text>
                <Text className="text-gray-600 mt-1 text-[11px]">
                  {formatCreatedDate(review.reviews[1].createdDate)}
                </Text>
              </View>
            </View>
            <Text className="mt-2 italic text-gray-800 text-[12px]">
              {review.reviews[1].comment}
            </Text>
            {review.reviews[1].imageUrls.length > 0 && (
              <View className="flex-row gap-x-2 mt-1">
                {review.reviews[1].imageUrls.map((imageUrl) => (
                  <TouchableOpacity
                    key={imageUrl}
                    onPress={() => {
                      globalImageViewState.setUrl(imageUrl);
                      globalImageViewState.setDescription("");
                      globalImageViewState.setIsModalVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-[90px] h-[90px] rounded-md"
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
  if (reviewFetcher.isFetching) {
    return (
      <View className="mt-2 bg-white p-2 items-center justify-center">
        <ActivityIndicator animating={true} color="#FCF450" />
      </View>
    );
  }
  if (reviewFetcher.isError) {
    // console.error(reportsFetcher.error);
    return null;
  }

  return (
    <View className="mt-2 bg-white p-2">
      <View className={`rounded-md ${containerStyleClasses}`}>
        {getOrderReviewInfo()}
      </View>
    </View>
  );
};

export default OrderReviewInfo;
