import { View, Text, SafeAreaView, Image } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Mapbox from "@rnmapbox/maps";
import useMapLocationState from "@/hooks/states/useMapLocationState";
import { images } from "@/constants";
import apiClient from "@/services/api-services/api-client";
if (Mapbox) {
  Mapbox.setAccessToken(
    "sk.eyJ1IjoiMXdvbGZhbG9uZTEiLCJhIjoiY20zdjRjY2M4MHA0bDJqczkwY252NnhvdyJ9.nrhMmt33T1W-Weqz2zXZpg"
  );
  //   Mapbox.setConnected(true);
}
const GOONG_API_KEY = `PElNdAGV5G98AeTOVaRfIZVeBO6XdVPhJSn2HDku`;
const MapPage = () => {
  const globalMapState = useMapLocationState();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  /* Sử dụng Load Map */ // Kiểu URL cho bản đồ
  const [loadMap] = useState(
    `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_API_KEY}`
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

  const getPlacesAutocomplete = async () => {
    if (search.trim() === "") {
      setSuggestions([]); // Xóa gợi ý nếu không có đầu vào
      return;
    }

    try {
      let autoComplete = await apiClient.get(
        `https://rsapi.goong.io/place/autocomplete?input=${search}&location=10.88058,106.794595&limit=10&radius=5&api_key=${GOONG_API_KEY}`
      );
      setSuggestions(autoComplete.data?.predictions || []);
    } catch (error) {
      console.log("Error fetching autocomplete suggestions:", error);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
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
              <Image
                source={images.logo}
                className="ml-2 w-[100px] h-[100px]"
                resizeMode="contain"
              />
              <Mapbox.Callout title={`${item.label}`} />
            </Mapbox.PointAnnotation>
          ))}
        </Mapbox.MapView>
      </View>
    </SafeAreaView>
  );
};

export default MapPage;
