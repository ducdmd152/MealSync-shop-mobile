import { View, Text, SafeAreaView, Image, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Mapbox from "@rnmapbox/maps";
import useMapLocationState from "@/hooks/states/useMapLocationState";
import { images } from "@/constants";
import apiClient from "@/services/api-services/api-client";
import CustomButton from "@/components/custom/CustomButton";
import CustomSearchingSelectList from "@/components/custom/CustomSearchingSelectList";
import axios from "axios";
import geoService from "@/services/geo-service";
import { router, useFocusEffect } from "expo-router";
if (Mapbox) {
  Mapbox.setAccessToken(
    "sk.eyJ1IjoiMXdvbGZhbG9uZTEiLCJhIjoiY20zdjRjY2M4MHA0bDJqczkwY252NnhvdyJ9.nrhMmt33T1W-Weqz2zXZpg"
  );
  //   Mapbox.setConnected(true);
}
const GOONG_API_KEY_LOAD_MAP = `PElNdAGV5G98AeTOVaRfIZVeBO6XdVPhJSn2HDku`;
const GOONG_API_KEY_LOAD_LOCATIONS = `SGAxF8mB2bUZahAHucHJyazGmy7THge2YIGAOd5n`;

const MapPage = () => {
  const globalMapState = useMapLocationState();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  /* Sử dụng Load Map */ // Kiểu URL cho bản đồ
  const [loadMap] = useState(
    `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_API_KEY_LOAD_MAP}`
  );

  const coordinates =
    globalMapState.id == -1
      ? [106.794595, 10.88058]
      : [globalMapState.longitude, globalMapState.latitude];
  // Vị trí mà bản đồ nên căn giữa ~ Khu A & B. [lng, lat]
  const locations = [
    {
      label: "KTX ĐHQG Khu A",
      coordinates: [106.806164, 10.878326],
    },
    {
      label: "KTX ĐHQG Khu B",
      coordinates: [106.782512, 10.882186],
    },
  ];
  const isSubmittable = geoService.isWithinRadius(
    {
      long: globalMapState.longitude,
      lat: globalMapState.latitude,
    },
    locations.map((item) => ({
      long: item.coordinates[0],
      lat: item.coordinates[1],
    }))
  );

  // const camera = useRef<Mapbox.Camera>();

  const handleOnPress = (feature: GeoJSON.Feature) => {};

  const getPlacesAutocomplete = async (search = "") => {
    if (search.trim() == "") {
      setSuggestions([]); // Xóa gợi ý nếu không có đầu vào
      return;
    }

    try {
      let autoComplete = await axios.get(
        `https://rsapi.goong.io/place/autocomplete?input=${search}&location=10.88058,106.794595&limit=5&radius=5&api_key=${GOONG_API_KEY_LOAD_LOCATIONS}`
      );
      setSuggestions(autoComplete.data?.predictions || []);
      // console.log(
      //   "autoComplete.data?.predictions: ",
      //   suggestions.map((item) => ({
      //     key: item?.place_id || (Math.random() % 1_00_000_000).toString(),
      //     value: item?.description || "",
      //   }))
      // );
    } catch (error: any) {
      console.log(
        "Error fetching autocomplete suggestions:",
        error?.response?.data
      );
    }
  };

  const getPlaceDetail = async () => {
    // console.log("getPlaceDetail: ", getPlaceDetail, selectedLocation);
    if (!selectedLocation) return;
    try {
      let placeDetail = await axios.get(
        `https://rsapi.goong.io/place/detail?place_id=${selectedLocation?.place_id}&api_key=${GOONG_API_KEY_LOAD_LOCATIONS}`
      );
      // console.log("placeDetail: ", placeDetail.data?.result);
      if (
        !geoService.isWithinRadius(
          {
            long: placeDetail?.data?.result.geometry.location.lng || 0.1,
            lat: placeDetail?.data?.result.geometry.location.lat || 0.1,
          },
          locations.map((item) => ({
            long: item.coordinates[0],
            lat: item.coordinates[1],
          }))
        )
      ) {
        Alert.alert(
          "Oops",
          "Vui lòng chọn vị trí nằm trong bán kính 3km kể từ KTX khu A hoặc KTX khu B!"
        );
        return;
      }
      globalMapState.setId(0);
      globalMapState.setLocation(
        selectedLocation?.structured_formatting.main_text || "",
        placeDetail?.data?.result.geometry.location.lat || 0.1,
        placeDetail?.data?.result.geometry.location.lng || 0.1
      );
      // console.log(
      //   "setted: ",
      //   selectedLocation?.description || "",
      //   placeDetail?.data?.result.geometry.location.lat || 0.1,
      //   placeDetail?.data?.result.geometry.location.lng || 0.1
      // );
    } catch (error: any) {
      console.log("Error fetching place details:", error?.response?.data);
    }
  };

  useEffect(() => {
    getPlaceDetail();
  }, [selectedLocation]);
  useFocusEffect(
    useCallback(() => {
      setSelectedLocation(undefined);
      // setIsFocusing(true);
      // return () => {
      //   setIsFocusing(false);
      // };
    }, [])
  );
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} className="relative">
        <View className="w-full  z-10 absolute top-2  justify-center items-center">
          <View className="w-[96%] bg-white rounded-md">
            <CustomSearchingSelectList
              defaultOption={
                selectedLocation
                  ? {
                      key:
                        selectedLocation?.place_id ||
                        (Math.random() % 1_00_000_000).toString(),
                      value: selectedLocation?.description || "",
                    }
                  : {
                      key: (Math.random() % 100_000_000).toString(),
                      value: globalMapState.address,
                    }
              }
              dropdownShown={globalMapState.id == -1}
              onSearch={(text: string) => getPlacesAutocomplete(text)}
              setSelected={(key: string) =>
                setSelectedLocation(
                  suggestions.find((item) => item?.place_id == key)
                )
              }
              data={
                suggestions.map((item) => ({
                  key:
                    item?.place_id || (Math.random() % 1_00_000_000).toString(),
                  value: item?.description || "",
                })) || []
              }
              save="key"
              search={true}
              notFoundText="Không tìm thấy"
              placeholder="Tìm kiếm địa chỉ..."
              searchPlaceholder="Tìm kiếm địa chỉ..."
            />
          </View>
        </View>
        <CustomButton
          isDisabled={!isSubmittable}
          title="Hoàn tất"
          handlePress={() => {
            router.back();
          }}
          containerStyleClasses="w-[96%] mx-2 mt-5 h-[40px] px-4 bg-transparent border-0 border-gray-200 bg-secondary font-semibold z-10 absolute bottom-2"
          textStyleClasses="text-[17px] text-gray-900 ml-1 text-white"
        />
        <Mapbox.MapView
          logoEnabled={false}
          styleURL={loadMap}
          onPress={handleOnPress}
          style={{ flex: 1 }}
          projection="globe" // Phép chiếu được sử dụng khi hiển thị bản đồ
          zoomEnabled={true}
        >
          <Mapbox.Camera
            // ref={camera}
            zoomLevel={12.5} // Mức thu phóng của bản đồ
            centerCoordinate={coordinates}
          />
          {globalMapState.id != -1 && (
            <Mapbox.PointAnnotation
              id={`pointID-${
                globalMapState.longitude + ":" + globalMapState.latitude
              }`} // ID duy nhất cho mỗi điểm chú thích
              key={`pointKey-${
                globalMapState.longitude + ":" + globalMapState.latitude
              }`} // Khóa duy nhất cho mỗi điểm chú thích
              coordinate={[globalMapState.longitude, globalMapState.latitude]} // Tọa độ của điểm hiển thị
              draggable={false} // Cho phép kéo điểm chú thích
            >
              {/* Bạn có thể thêm hình ảnh hoặc biểu tượng vào đây */}
              {/* <Image
                source={images.mark}
                className="w-[40px] h-[40px]"
                resizeMode="contain"
              /> */}
              <Mapbox.Callout title={`${globalMapState.address}`} />
            </Mapbox.PointAnnotation>
          )}
          {locations.map((item, index) => (
            <Mapbox.PointAnnotation
              id={`pointID-${index}-${item.label}`} // ID duy nhất cho mỗi điểm chú thích
              key={`pointKey-${index}-${item.label}`} // Khóa duy nhất cho mỗi điểm chú thích
              coordinate={item.coordinates} // Tọa độ của điểm hiển thị
              draggable={false} // Cho phép kéo điểm chú thích
            >
              {/* Bạn có thể thêm hình ảnh hoặc biểu tượng vào đây */}
              {/* <Image
                source={images.mark}
                className="w-[40px] h-[40px]"
                resizeMode="contain"
              /> */}
              <Mapbox.Callout title={`${item.label}`} />
            </Mapbox.PointAnnotation>
          ))}
        </Mapbox.MapView>
      </View>
    </SafeAreaView>
  );
};

export default MapPage;
