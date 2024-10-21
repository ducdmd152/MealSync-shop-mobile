import { View, Text } from "react-native";
import React, { useEffect } from "react";

interface Props {
  orderId: number;
  onNotFound?: () => void;
}
const OrderDetail = ({ orderId, onNotFound = () => {} }: Props) => {
  useEffect(() => {
    onNotFound();
  }, []);
  return (
    <View>
      <Text>OrderDetail {orderId}</Text>
    </View>
  );
};

export default OrderDetail;
