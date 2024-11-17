import { View, Text, Dimensions, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import useGlobalOrderDetailState from "@/hooks/states/useGlobalOrderDetailState";
import { BottomSheet } from "@rneui/base";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import OrderDetail from "../order/OrderDetail";
const detailBottomHeight = Dimensions.get("window").height - 92;
const OrderDetailBottomSheet = () => {
  const globalOrderDetailState = useGlobalOrderDetailState();
  const [detailBottomSheetDisplay, setDetailBottomSheetDisplay] =
    useState(true);
  useEffect(() => {
    // if (!globalOrderDetailState.isDetailBottomSheetVisible)
    //   globalOrderDetailState.onAfterCompleted();
  }, [globalOrderDetailState.isDetailBottomSheetVisible]);
  return (
    <BottomSheet
      modalProps={{}}
      isVisible={globalOrderDetailState.isDetailBottomSheetVisible}
      containerStyle={{ zIndex: 101 }}
    >
      {detailBottomSheetDisplay && (
        <View
          className={`p-4 bg-white rounded-t-lg min-h-[120px]`}
          style={{ height: detailBottomHeight }}
        >
          <TouchableOpacity
            className="items-center"
            onPress={() =>
              globalOrderDetailState.setIsDetailBottomSheetVisible(false)
            }
          >
            <Ionicons name="chevron-down-outline" size={24} color="gray" />
          </TouchableOpacity>
          <View className="flex-1 mt-2">
            <OrderDetail
              hasHeaderInfo={true}
              orderId={globalOrderDetailState.id}
              onNotFound={() => {
                setDetailBottomSheetDisplay(false);
                Alert.alert(
                  `Đơn hàng MS-${globalOrderDetailState.id} không tồn tại`,
                  "Vui lòng thử lại!"
                );
                setTimeout(() => {
                  globalOrderDetailState.setIsDetailBottomSheetVisible(false);
                  setTimeout(() => setDetailBottomSheetDisplay(true), 1000);
                }, 1000);
              }}
            />
          </View>
        </View>
      )}
    </BottomSheet>
  );
};

export default OrderDetailBottomSheet;
