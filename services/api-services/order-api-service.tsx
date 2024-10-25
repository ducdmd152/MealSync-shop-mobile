import { FetchResponseValue } from "@/types/responses/FetchResponse";
import apiClient from "./api-client";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";

const orderAPIService = {
  reject: async (
    orderId: number,
    onSuccess: () => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean
    ) => {}
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/order/${orderId}/reject`,
        {
          reason: "no-comment",
        }
      );
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        onSuccess();
      } else if (isWarning) {
        onWarning(value as WarningMessageValue);
      } else {
        onFailure(error);
      }
    } catch (error: any) {
      onFailure(error);
    } finally {
      setIsSubmitting(false);
    }
  },
};

export default orderAPIService;
