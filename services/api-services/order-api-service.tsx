import { FetchResponseValue } from "@/types/responses/FetchResponse";
import apiClient from "./api-client";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";
import { ShopDeliveryStaff } from "@/types/models/StaffInfoModel";

const orderAPIService = {
  confirm: async (
    orderId: number,
    onSuccess: () => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean,
    ) => {},
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/order/${orderId}/confirm`,
        {
          reason: "no-comment",
        },
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
  reject: async (
    orderId: number,
    reason: string,
    onSuccess: () => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean,
    ) => {},
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/order/${orderId}/reject`,
        {
          reason: reason || "no-comment",
        },
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
  prepare: async (
    orderId: number,
    onSuccess: () => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    isConfirmWarning: boolean = false,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean,
    ) => {},
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/order/${orderId}/preparing`,
        {
          reason: "no-comment",
          isConfirm: isConfirmWarning,
        },
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
  cancel: async (
    orderId: number,
    reason: string,
    onSuccess: () => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    isConfirmWarning: boolean = false,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean,
    ) => {},
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/order/${orderId}/cancel`,
        {
          reason: reason || "no-comment",
          isConfirm: isConfirmWarning,
        },
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
  assign: async (
    orderId: number,
    staffId: number,
    onSuccess: (shopDeliveryStaff: ShopDeliveryStaff) => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    isConfirmWarning: boolean = false,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean,
    ) => {},
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/order/${orderId}/assign`,
        {
          shopDeliveryStaffId: staffId == 0 ? null : staffId,
          isConfirm: isConfirmWarning,
          reason: "no-comment",
        },
      );
      const { value, isSuccess, isWarning, error } = response.data;

      if (isSuccess) {
        console.log("Success: ", response.data, value);
        onSuccess(value as ShopDeliveryStaff);
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
  delivery: async (
    orderIds: number[],
    onSuccess: () => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean,
    ) => {},
    isConfirmWarning: boolean = false,
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner-staff/order/delivering`,
        {
          ids: orderIds,
          isConfirm: isConfirmWarning,
        },
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
