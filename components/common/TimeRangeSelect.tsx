import { View, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { FetchOnlyListResponse } from "@/types/responses/FetchResponse";
import { OperatingSlotModel } from "@/types/models/OperatingSlotModel";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import ScrollPicker, {
  ScrollPickerHandle,
} from "react-native-wheel-scrollview-picker";
import CustomButton from "../custom/CustomButton";

const formatTime = (time: number): string => {
  const hours = Math.floor(time / 100)
    .toString()
    .padStart(2, "0");
  const minutes = (time % 100).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
const formatDate = (dateString: string): string => {
  const date = new Date(dateString.replace(/\//g, "-"));
  return date.toLocaleDateString("en-GB");
};
type TimeRange = {
  startTime: number;
  endTime: number;
};

const convertToTimeRanges = (timeRanges: TimeRange[]): TimeRange[] => {
  const result: TimeRange[] = [];

  const convertToMinutes = (time: number): number => {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    return hours * 60 + minutes;
  };

  const convertToHHMM = (minutes: number): number => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours * 100 + mins; // Định dạng lại thành hh:mm
  };

  timeRanges.forEach(({ startTime, endTime }) => {
    const startMinutes = convertToMinutes(startTime);
    const endMinutes = convertToMinutes(endTime);

    for (let time = startMinutes; time < endMinutes; time += 30) {
      const nextTime = time + 30;
      if (nextTime <= endMinutes) {
        result.push({
          startTime: convertToHHMM(time),
          endTime: convertToHHMM(nextTime),
        });
      }
    }
  });

  return result;
};
interface Props {
  containerStyleClasses?: string;
}
const TimeRangeSelect = ({ containerStyleClasses = "" }: Props) => {
  const refStart = useRef<ScrollPickerHandle>(null);
  const refEnd = useRef<ScrollPickerHandle>(null);
  const [selectedStartIndex, setSelectdStartIndex] = useState(0);
  const [selectedEndIndex, setSelectdEndIndex] = useState(0);
  const {
    data: operatingSlots,
    isLoading: isOperatingSlotsLoading,
    error: operatingSlotsError,
    refetch: operatingSlotsRefetch,
  } = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.OPERATING_SLOT_LIST,
    (): Promise<FetchOnlyListResponse<OperatingSlotModel>> =>
      apiClient
        .get(endpoints.OPERATING_SLOT_LIST)
        .then((response) => response.data),
    []
  );
  const timeRanges: TimeRange[] = convertToTimeRanges(
    operatingSlots?.value.map((item: OperatingSlotModel) => ({
      startTime: item.startTime,
      endTime: item.endTime,
    })) || []
  );
  //   console.log("operatingSlots: ", operatingSlots?.value);
  //   console.log(
  //     "timeRanges: ",
  //     timeRanges.map((range) => range.startTime)
  //   );
  useEffect(() => {
    setSelectdEndIndex(selectedStartIndex);
    refEnd.current && refEnd.current.scrollToTargetIndex(selectedStartIndex);
  }, [selectedStartIndex]);
  useEffect(() => {
    if (
      timeRanges[selectedStartIndex].startTime >=
      timeRanges[selectedEndIndex].endTime
    ) {
      setSelectdStartIndex(selectedEndIndex);
      refStart.current &&
        refStart.current.scrollToTargetIndex(selectedEndIndex);
    }
  }, [selectedEndIndex]);
  return (
    <View className="w-full containerStyleClasses">
      <Text className="text-md font-semibold text-center mb-4">
        Vui lòng chọn khoảng thời gian
      </Text>

      <View className="h-[120] flex-row">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-center">Bắt đầu</Text>
          <ScrollPicker
            ref={refStart}
            wrapperHeight={100}
            dataSource={timeRanges.map((range) => range.startTime)}
            selectedIndex={selectedStartIndex}
            renderItem={(item, index) => {
              return (
                <Text
                  className={`text-lg text-gray-600 ${
                    index == selectedStartIndex &&
                    "font-semibold text-gray-800 "
                  }`}
                >
                  {formatTime(item)}
                </Text>
              );
            }}
            onValueChange={(item, selectedIndex) => {
              if (selectedIndex == timeRanges.length) {
                refStart.current &&
                  refStart.current.scrollToTargetIndex(selectedIndex - 1);
                setSelectdStartIndex(selectedIndex - 1);
              } else {
                setSelectdStartIndex(selectedIndex);
              }
            }}
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-center">Kết thúc</Text>
          <ScrollPicker
            ref={refEnd}
            wrapperHeight={100}
            dataSource={timeRanges.map((range) => range.endTime)}
            selectedIndex={selectedEndIndex}
            renderItem={(item, index) => {
              return (
                <Text
                  className={`text-lg text-gray-600 ${
                    index == selectedEndIndex && "font-semibold text-gray-800 "
                  }`}
                >
                  {formatTime(item)}
                </Text>
              );
            }}
            onValueChange={(item, selectedIndex) => {
              if (selectedIndex == timeRanges.length) {
                refEnd.current &&
                  refEnd.current.scrollToTargetIndex(selectedIndex - 1);
                setSelectdEndIndex(selectedIndex - 1);
              } else {
                setSelectdEndIndex(selectedIndex);
              }
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default TimeRangeSelect;
