import { View, Text, SafeAreaView, Image } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Mapbox from "@rnmapbox/maps";
import useMapLocationState from "@/hooks/states/useMapLocationState";
import { images } from "@/constants";
import apiClient from "@/services/api-services/api-client";
import CustomButton from "@/components/custom/CustomButton";
import CustomSearchingSelectList from "@/components/custom/CustomSearchingSelectList";
import axios from "axios";
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
    globalMapState.id == 0
      ? [106.794595, 10.88058]
      : [globalMapState.longitude, globalMapState.latitude];
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
  // Vị trí mà bản đồ nên căn giữa ~ Khu A & B. [lng, lat]

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
      console.log(
        "autoComplete.data?.predictions: ",
        autoComplete.data?.predictions
      );
    } catch (error: any) {
      console.log(
        "Error fetching autocomplete suggestions:",
        error?.response?.data
      );
    }
  };
  useEffect(() => {
    getPlacesAutocomplete();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} className="relative">
        <View className="w-full  z-10 absolute top-2  justify-center items-center">
          <View className="w-[96%] bg-white rounded-md">
            <CustomSearchingSelectList
              dropdownShown={true}
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
          title="Hoàn tất"
          handlePress={() => {}}
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
