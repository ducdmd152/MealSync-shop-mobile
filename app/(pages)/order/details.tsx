import { View, Text, Alert } from "react-native";
import React from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import OrderDetail from "@/components/order/OrderDetail";
import useOrderDetailPageState from "@/hooks/states/useOrderDetailPageState";
import { router } from "expo-router";

const OrderDetails = () => {
  const globalOrderDetailPageState = useOrderDetailPageState();
  return (
    <PageLayoutWrapper>
      <View className="flex-1 mt-2 p-4">
        <OrderDetail
          order={globalOrderDetailPageState.order}
          setOrder={globalOrderDetailPageState.setOrder}
          orderId={globalOrderDetailPageState.order.id}
          onNotFound={() => {
            Alert.alert(
              `Đơn hàng MS-${globalOrderDetailPageState.order.id} không tồn tại`,
              "Vui lòng thử lại!"
            );
            globalOrderDetailPageState.onBeforeBack();
            router.back();
          }}
        />
      </View>
    </PageLayoutWrapper>
  );
};

export default OrderDetails;
