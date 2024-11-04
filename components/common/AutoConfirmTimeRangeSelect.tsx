import { View, Text } from "react-native";
import React, { ReactNode, useEffect, useRef, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import useTimeRangeState from "@/hooks/states/useTimeRangeState";

const formatTime = (time: number): string => {
  const hours = Math.floor(time / 100)
    .toString()
    .padStart(2, "0");
  const minutes = Math.round(time % 100)
    .toString()
    .padStart(2, "0");
  return `${hours}h${minutes}`;
};

export const autoConfirmTimeFormat = (time: number): string => {
  const hours = Math.floor(time / 100).toString();
  const minutes = Math.round(time % 100)
    .toString()
    .padStart(2, "0");
  return `${hours}h${time % 100 > 0 ? minutes + "" : ""}`;
};
const formatDate = (dateString: string): string => {
  const date = new Date(dateString.replace(/\//g, "-"));
  return date.toLocaleDateString("en-GB");
};
export type TimeRange = {
  startTime: number;
  endTime: number;
};

const convertToTimeFrames = (timeRanges: TimeRange[]): TimeRange[] => {
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
  header?: ReactNode;
  containerStyleClasses?: string;
  startTime: number;
  endTime: number;
  setStartTime: (startTime: number) => void;
  setEndTime: (endTime: number) => void;
  isAutoSameEndTimeOfStartSelect?: boolean;
}
const AutoConfirmTimeRangeSelect = ({
  containerStyleClasses = "",
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  header,
  isAutoSameEndTimeOfStartSelect = false,
}: Props) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refStart = useRef<ScrollPickerHandle>(null);
  const refEnd = useRef<ScrollPickerHandle>(null);
  const [selectedStartIndex, setSelectdStartIndex] = useState(0);
  const [selectedEndIndex, setSelectdEndIndex] = useState(0);

  const handleStartTimeChange = (
    index: number,
    isAutoSameEndTimeOfStartSelect: boolean = true
  ) => {
    if (frames.length == 0) return;
    const selectedIndex = index == frames.length ? index - 1 : index;
    if (
      selectedStartIndex == selectedIndex &&
      startTime == frames[selectedIndex].startTime
    )
      return;
    refStart.current && refStart.current.scrollToTargetIndex(selectedIndex);
    setSelectdStartIndex(selectedIndex);
    setStartTime(frames[selectedIndex].startTime);
    // console.log(
    //   "isAutoSameEndTimeOfStartSelect || endTime <= frames[selectedIndex].startTime",
    //   isAutoSameEndTimeOfStartSelect,
    //   endTime <= frames[selectedIndex].startTime
    // );
    if (
      isAutoSameEndTimeOfStartSelect ||
      endTime <= frames[selectedIndex].startTime
    )
      handleEndTimeChange(selectedIndex, false);
  };
  const handleEndTimeChange = (
    index: number,
    isAutoFixStartTime: boolean = true
  ) => {
    if (frames.length == 0) return;
    const selectedIndex = index == frames.length ? index - 1 : index;
    if (
      selectedEndIndex == selectedIndex &&
      endTime == frames[selectedIndex].endTime
    )
      return;
    refEnd.current && refEnd.current.scrollToTargetIndex(selectedIndex);
    setSelectdEndIndex(selectedIndex);
    setEndTime(frames[selectedIndex].endTime);
    if (isAutoFixStartTime) {
      if (
        frames[selectedStartIndex].startTime >= frames[selectedIndex].endTime
      ) {
        handleStartTimeChange(selectedIndex, false);
      }
    }
  };

  const [frames, setFrames] = useState(
    convertToTimeFrames([
      {
        startTime: 100,
        endTime: 600,
      },
    ])
  );

  const initStateMapping = () => {
    if (frames.length == 0) return;
    const foundStartIndex = frames.findIndex(
      (item) => item.startTime === startTime
    );
    handleStartTimeChange(foundStartIndex !== -1 ? foundStartIndex : 0, false);

    const foundEndIndex = frames.findIndex((item) => item.endTime === endTime);
    handleEndTimeChange(foundEndIndex !== -1 ? foundEndIndex : 0, false);
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsRefreshing(true);

      initStateMapping();
      setTimeout(() => {
        setIsRefreshing(false);
      }, 0);
    }, [])
  );

  //   useEffect(() => {
  //     if (frames.length == 0) return;
  //     handleEndTimeChange(selectedStartIndex);
  //   }, [selectedStartIndex]);

  //   useEffect(() => {
  //     if (frames.length == 0) return;
  //     if (
  //       frames[selectedStartIndex].startTime >= frames[selectedEndIndex].endTime
  //     ) {
  //       handleStartTimeChange(selectedEndIndex);
  //     }
  //   }, [selectedEndIndex]);

  return (
    <View className={`w-full ${containerStyleClasses}`}>
      {header || (
        <Text className="text-md font-semibold text-center mb-4">
          Vui lòng chọn khoảng thời gian
        </Text>
      )}

      <View className="h-[120] flex-row">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-center">
            Khoảng từ trước
          </Text>
          {isRefreshing || (
            <ScrollPicker
              ref={refEnd}
              wrapperHeight={100}
              dataSource={frames.map((range) => range.endTime)}
              selectedIndex={selectedEndIndex}
              renderItem={(item, index) => {
                return (
                  <Text
                    className={`text-lg text-gray-600 ${
                      index == selectedEndIndex &&
                      "font-semibold text-gray-800 "
                    }`}
                  >
                    {formatTime(item)}
                  </Text>
                );
              }}
              onValueChange={(item, selectedIndex) => {
                if (frames.length == 0) return;
                handleEndTimeChange(selectedIndex);
              }}
            />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-center">Đến trước</Text>

          {isRefreshing || (
            <ScrollPicker
              ref={refStart}
              wrapperHeight={100}
              dataSource={frames.map((range) => range.startTime)}
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
                if (frames.length == 0) return;
                handleStartTimeChange(
                  selectedIndex,
                  isAutoSameEndTimeOfStartSelect
                );
              }}
            />
          )}
        </View>
      </View>
      <Text className={` italic text-md text-gray-600 mt-2 text-center`}>
        Tự động xác nhận đơn hàng trong khoảng từ trước{" "}
        <Text className="font-medium">{autoConfirmTimeFormat(endTime)}</Text>{" "}
        đến{" "}
        <Text className="font-medium">{autoConfirmTimeFormat(startTime)}</Text>{" "}
        {"\n"} trước thời điểm bắt đầu khung đặt hàng
      </Text>
    </View>
  );
};

export default AutoConfirmTimeRangeSelect;
