import { FetchResponseValue } from "@/types/responses/FetchResponse";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import { ShopDeliveryStaff } from "@/types/models/StaffInfoModel";
import OrderFetchModel from "@/types/models/OrderFetchModel";
import orderAPIService from "./api-services/order-api-service";
import utilService from "./util-service";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

const onMultiDelivery = (
  orderIds: number[],
  onSuccess: () => void,
  onError: (error: any) => void,
  isConfirm = false
) => {
  orderAPIService.delivery(
    orderIds,
    () => {
      onSuccess();
    },
    (warningInfo: WarningMessageValue) => {
      if (isConfirm) return;
      Alert.alert("Xác nhận", warningInfo.message, [
        {
          text: "Xác nhận",
          onPress: async () => {
            onMultiDelivery(orderIds, onSuccess, onError, true);
          },
        },
        {
          text: "Hủy",
        },
      ]);
    },
    (error: any) => {
      onError(error);
    }
  );
};
const onDelivery = (
  order: OrderFetchModel,
  onRefresh: () => void,
  onSuccess: () => void,
  onError: (error: any) => void,
  onBeforeSubmit = () => {}
) => {
  if (
    utilService.isCurrentTimeGreaterThanEndTime({
      startTime: order.startTime,
      endTime: order.endTime,
      intendedReceiveDate: order.intendedReceiveDate,
    })
  ) {
    Alert.alert("Oops!", "Đã quá thời gian để thực hiện thao tác này!");
    onRefresh();
    return;
  }

  Alert.alert(
    "Xác nhận",
    `Chuyển đơn MS-${order.id} sang trạng thái giao hàng?`,
    [
      {
        text: "Xác nhận",
        onPress: async () => {
          onBeforeSubmit();
          onMultiDelivery([order.id], onSuccess, onError);
        },
      },
      {
        text: "Hủy",
      },
    ]
  );
};

const orderUIService = {
  onDelivery,
  onMultiDelivery,
};

export default orderUIService;
