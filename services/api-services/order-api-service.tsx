import { FetchResponseValue } from "@/types/responses/FetchResponse";
import apiClient from "./api-client";
import OrderDetailModel from "@/types/models/OrderDetailModel";
import { WarningMessageValue } from "@/types/responses/WarningMessageResponse";

const orderAPIService = {
  confirm: async (
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
        `shop-owner/order/${orderId}/confirm`,
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
  prepare: async (
    orderId: number,
    onSuccess: () => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    isConfirmWarning: boolean = false,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean
    ) => {}
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/order/${orderId}/preparing`,
        {
          reason: "no-comment",
          isConfirm: isConfirmWarning,
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
  cancel: async (
    orderId: number,
    onSuccess: () => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    isConfirmWarning: boolean = false,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean
    ) => {}
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/order/${orderId}/cancel`,
        {
          reason: "no-comment",
          isConfirm: isConfirmWarning,
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
  assign: async (
    orderId: number,
    staffId: number,
    onSuccess: () => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    isConfirmWarning: boolean = false,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean
    ) => {}
  ) => {
    try {
      setIsSubmitting(true);
      // const response = await apiClient.put(
      //   `shop-owner/order/${orderId}/assign`,
      //   {
      //     shopDeliveryStaffId: staffId == 0 ? null : staffId,
      //     isConfirm: isConfirmWarning,
      //     reason: "no-comment",
      //   }
      // );
      // const { value, isSuccess, isWarning, error } = response.data;
      const { isSuccess, isWarning, error } = {
        isSuccess: true,
        isWarning: false,
        error: false,
      };

      if (isSuccess) {
        onSuccess();
      } else if (isWarning) {
        // onWarning(value as WarningMessageValue);
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
    orderId: number,
    onSuccess: () => void,
    onWarning: (warningInfo: WarningMessageValue) => void,
    onFailure: (error: any) => void,
    setIsSubmitting: (isSubmitting: boolean) => void = (
      isSubmitting: boolean
    ) => {},
    isConfirmWarning: boolean = false
  ) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.put(
        `shop-owner/order/${orderId}/delivering`,
        {
          reason: "no-comment",
          isConfirm: isConfirmWarning,
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
