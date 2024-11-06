import { View, Text, Touchable, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, ProgressBar } from "react-native-paper";
import CONSTANTS from "@/constants/data";
import { Rating } from "react-native-elements";
import CustomButton from "@/components/custom/CustomButton";
import sessionService from "@/services/session-service";
import { endpoints } from "@/services/api-services/api-service-instances";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import FetchResponse, {
  FetchOnlyListResponse,
  FetchResponseValue,
  FetchValueResponse,
} from "@/types/responses/FetchResponse";
import apiClient from "@/services/api-services/api-client";
import dayjs from "dayjs";
import useGlobalOrderDetailState from "@/hooks/states/useGlobalOrderDetailState";
import useGlobalImageViewingState from "@/hooks/states/useGlobalImageViewingState";
import { useFocusEffect } from "expo-router";
import useGlobalReviewReplyState from "@/hooks/states/useGlobalReviewReplyState";
const isOver24Hours = (createdDate: string) => {
  const now = dayjs();
  const reviewDate = dayjs(createdDate);
  // console.log(now, createdDate, now.diff(reviewDate, "hour"));
  return now.diff(reviewDate, "hour") >= 24;
};
const formatCreatedDate = (createdDate: string): string => {
  const date = dayjs(createdDate).add(7, "hours");
  const now = dayjs();
  const daysDiff = now.diff(date, "day");

  // console.log("createdDate: ", createdDate, new Date(createdDate), date);
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
interface FetchReviewModel {
  reviewOverview: {
    totalReview: number;
    ratingAverage: number;
    totalOneStar: number;
    totalTwoStar: number;
    totalThreeStar: number;
    totalFourStar: number;
    totalFiveStar: number;
  };
  reviews: FetchResponseValue<ReviewModel>;
}
const Review = () => {
  // (async () => {
  //   console.log(await sessionService.getAuthToken());
  // })();
  const globalOrderDetailState = useGlobalOrderDetailState();
  const globalImageViewState = useGlobalImageViewingState();
  const globalReviewReplyState = useGlobalReviewReplyState();
  const [query, setQuery] = useState<{
    rating: number;
    searchValue: string;
    pageIndex: number;
    pageSize: number;
  }>({ rating: 0, searchValue: "", pageIndex: 1, pageSize: 100_000_000 });
  const reviewFetch = useFetchWithRQWithFetchFunc(
    [endpoints.REVIEWS].concat(["reviews-page"]),
    async (): Promise<FetchValueResponse<FetchReviewModel>> =>
      apiClient
        .get(endpoints.REVIEWS, {
          headers: {
            Authorization: `Bearer ${await sessionService.getAuthToken()}`,
          },
          params: {
            ...query,
            rating: query.rating == 0 ? undefined : query.rating,
          },
        })
        .then((response) => response.data),
    [query]
  );
  useFocusEffect(
    React.useCallback(() => {
      reviewFetch.refetch();
    }, [])
  );
  // console.log(reviewFetch.data?.value.reviewOverview.totalReview);
  return (
    <PageLayoutWrapper>
      <View className="p-4">
        <View className="py-2 bg-[#ecfdf5] grow-0 rounded-[12px]">
          <TouchableOpacity
            onPress={() => setQuery({ ...query, rating: 0 })}
            className="flex-row p-2 items-center gap-x-2 px-4"
          >
            <Text className="text-lg font-bold">
              {reviewFetch.data?.value.reviewOverview.ratingAverage.toFixed(1)}
            </Text>
            <Ionicons name="star" size={21} color="#fde047" />
            <Text className="text-sm text-gray-700 ml-[8px]">
              {reviewFetch.data?.value.reviewOverview.totalReview} đánh giá
            </Text>
          </TouchableOpacity>
          <View className="h-[2px] bg-white"></View>
          <View className="p-3 px-4">
            <TouchableOpacity
              onPress={() => setQuery({ ...query, rating: 5 })}
              className="flex-row gap-2 items-center"
            >
              <Text className="text-gray-600">5</Text>
              <View className="flex-1">
                <ProgressBar
                  progress={
                    reviewFetch.data?.value.reviewOverview.totalReview
                      ? reviewFetch.data?.value.reviewOverview.totalFiveStar /
                        reviewFetch.data?.value.reviewOverview.totalReview
                      : 0
                  }
                  color={"#fde047"}
                  style={{ backgroundColor: "#e5e5e5" }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setQuery({ ...query, rating: 4 })}
              className="flex-row gap-2 items-center"
            >
              <Text className="text-gray-600">4</Text>
              <View className="flex-1">
                <ProgressBar
                  progress={
                    reviewFetch.data?.value.reviewOverview.totalReview
                      ? reviewFetch.data?.value.reviewOverview.totalFourStar /
                        reviewFetch.data?.value.reviewOverview.totalReview
                      : 0
                  }
                  color={"#fde047"}
                  style={{ backgroundColor: "#e5e5e5" }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setQuery({ ...query, rating: 3 })}
              className="flex-row gap-2 items-center"
            >
              <Text className="text-gray-600">3</Text>
              <View className="flex-1">
                <ProgressBar
                  progress={
                    reviewFetch.data?.value.reviewOverview.totalReview
                      ? reviewFetch.data?.value.reviewOverview.totalThreeStar /
                        reviewFetch.data?.value.reviewOverview.totalReview
                      : 0
                  }
                  color={"#fde047"}
                  style={{ backgroundColor: "#e5e5e5" }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setQuery({ ...query, rating: 2 })}
              className="flex-row gap-2 items-center"
            >
              <Text className="text-gray-600">2</Text>
              <View className="flex-1">
                <ProgressBar
                  progress={
                    reviewFetch.data?.value.reviewOverview.totalReview
                      ? reviewFetch.data?.value.reviewOverview.totalTwoStar /
                        reviewFetch.data?.value.reviewOverview.totalReview
                      : 0
                  }
                  color={"#fde047"}
                  style={{ backgroundColor: "#e5e5e5" }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setQuery({ ...query, rating: 1 })}
              className="flex-row gap-2 items-center"
            >
              <Text className="text-gray-600">1</Text>
              <View className="flex-1">
                <ProgressBar
                  progress={
                    reviewFetch.data?.value.reviewOverview.totalReview
                      ? reviewFetch.data?.value.reviewOverview.totalOneStar /
                        reviewFetch.data?.value.reviewOverview.totalReview
                      : 0
                  }
                  color={"#fde047"}
                  style={{ backgroundColor: "#e5e5e5" }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {query.rating != 0 && (
          <View className="flex-row items-center mt-4 justify-end">
            <Text className="text-gray-600 text-center italic ">
              {reviewFetch.data?.value.reviews.totalCount} lượt đánh giá{" "}
              {query.rating}{" "}
            </Text>
            <Ionicons name="star" size={12} color="#fde047" />
          </View>
        )}
        <View className="gap-y-[4px] mt-1">
          {reviewFetch.data?.value.reviews.items.map((review) => (
            <View className="p-4 py-1" key={review.orderId}>
              <View>
                <View className="mt-2 flex-row items-center justify-between">
                  <View className="flex-row gap-x-4 items-center">
                    <View className="w-[36px] justify-center items-center border-[1px] border-green-200 rounded-full">
                      <Avatar.Image
                        size={34}
                        source={{
                          uri:
                            review.reviews[0].avatar ||
                            CONSTANTS.url.userAvatarDefault,
                        }}
                      />
                    </View>
                    <Text className="text-gray-800">
                      {review.reviews[0].name}
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
                              reviewFetch.refetch();
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
                <Text className="mt-2 text-gray-800">
                  {review.reviews[0].comment}
                </Text>
                {review.reviews[0].imageUrls.length > 0 && (
                  <View className="flex-row gap-x-2 mt-1">
                    {review.reviews[0].imageUrls.map((imageUrl) => (
                      <TouchableOpacity
                        key={imageUrl}
                        onPress={() => {
                          globalImageViewState.setUrl(imageUrl);
                          globalImageViewState.setIsModalVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          className="w-[90px] h-[90px]"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <View className="flex-row items-center justify-between">
                  <Text
                    className="w-[70%] text-gray-500 text-[12px]"
                    ellipsizeMode="tail"
                    numberOfLines={1}
                  >
                    Đã đặt: {review.description}
                  </Text>
                  <CustomButton
                    title="Xem đơn"
                    handlePress={() => {
                      globalOrderDetailState.setId(review.orderId);
                      globalOrderDetailState.setIsActionsShowing(true);
                      globalOrderDetailState.setIsDetailBottomSheetVisible(
                        true
                      );
                    }}
                    iconRight={
                      <Ionicons
                        name="arrow-forward-outline"
                        size={15}
                        color="#3b82f6"
                      />
                    }
                    containerStyleClasses="w-fit bg-white"
                    textStyleClasses="ml-2 text-[#3b82f6] text-[12px]"
                  />
                </View>
              </View>
              {review.reviews.length > 1 && (
                <View className="mt-2 ml-4">
                  <Text>Reply</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default Review;
