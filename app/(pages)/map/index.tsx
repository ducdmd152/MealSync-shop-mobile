import { View, Text, SafeAreaView } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Mapbox from "@rnmapbox/maps";
import useMapLocationState from "@/hooks/states/useMapLocationState";
if (Mapbox) {
  Mapbox.setAccessToken(
    "sk.eyJ1IjoiMXdvbGZhbG9uZTEiLCJhIjoiY20zdjRjY2M4MHA0bDJqczkwY252NnhvdyJ9.nrhMmt33T1W-Weqz2zXZpg"
  );
  //   Mapbox.setConnected(true);
}
const MapPage = () => {
  const globalMapState = useMapLocationState();

  /* Sử dụng Load Map */ // Kiểu URL cho bản đồ
  const [loadMap] = useState(
    "https://tiles.goong.io/assets/goong_map_web.json?api_key=PElNdAGV5G98AeTOVaRfIZVeBO6XdVPhJSn2HDku"
  );
  const coordinates =
    globalMapState.id == 0
      ? [106.794595, 10.88058]
      : [globalMapState.longitude, globalMapState.latitude];
  // Vị trí mà bản đồ nên căn giữa ~ Khu A & B. [lng, lat]

  const camera = useRef<any | null>(null);
  const mapViewRef = useRef<any | null>(null);

  const handleOnPress = (feature: GeoJSON.Feature) => {};
  useEffect(() => {
    // if (mapViewRef && mapViewRef.current?.logoView?.isHidden) {
    //   mapViewRef.current.logoView.isHidden = true;
    // }
  }, [mapViewRef]);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Mapbox.MapView
          ref={mapViewRef}
          styleURL={loadMap}
          onPress={handleOnPress}
          style={{ flex: 1 }}
          projection="globe" // Phép chiếu được sử dụng khi hiển thị bản đồ
          zoomEnabled={true}
        >
          <Mapbox.Camera
            ref={camera}
            zoomLevel={14} // Mức thu phóng của bản đồ
            centerCoordinate={coordinates}
          />
        </Mapbox.MapView>
      </View>
    </SafeAreaView>
  );
};

export default MapPage;
