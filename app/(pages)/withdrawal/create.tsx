import { View, Text, Alert, TextInput, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import PromotionModel, {
  initPromotionSampleObject,
  PromotionApplyType,
  promotionApplyTypes,
} from "@/types/models/PromotionModel";
import dayjs from "dayjs";
import apiClient from "@/services/api-services/api-client";
import ValueResponse from "@/types/responses/ValueReponse";
import { useToast } from "react-native-toast-notifications";
import { router } from "expo-router";
import { Switch, TouchableRipple } from "react-native-paper";
import DateTimePicker from "react-native-ui-datepicker";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import ImageUpload from "@/components/common/ImageUpload";
import CustomButton from "@/components/custom/CustomButton";
import { SelectList } from "react-native-dropdown-select-list";
import utilService from "@/services/util-service";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import usePromotionModelState from "@/hooks/states/usePromotionModelState";
import useGlobalWithdrawalState from "@/hooks/states/useGlobalWithdrawalState";
// Initialize the timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);
interface WithdrawalCreateModel {
  amount: number;
  bankCode: string;
  bankShortName: string;
  bankAccountNumber: string;
  verifyCode: number;
}
const initWithdrawSampleObject = {
  amount: 0,
  bankCode: "",
  bankShortName: "",
  bankAccountNumber: "",
  verifyCode: 0,
};
const WithdrawalCreate = () => {
  const globalWithdrawalState = useGlobalWithdrawalState();
  const toast = useToast();
  const isAnyRequestSubmit = useRef(false);
  const [withdrawalCreateModel, setWithdrawalCreateModel] =
    useState<WithdrawalCreateModel>({
      ...initWithdrawSampleObject,
    });
  const [isFromDatePickerVisible, setFromDatePickerVisibility] =
    useState(false);
  const [isFromTimePickerVisible, setFromTimePickerVisibility] =
    useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
  const [isToTimePickerVisible, setToTimePickerVisibility] = useState(false);
  const toggleFromDatePicker = () => {
    setFromDatePickerVisibility(!isFromDatePickerVisible);
  };
  const toggleToDatePicker = () => {
    setToDatePickerVisibility(!isToDatePickerVisible);
  };

  const [errors, setErrors] = useState<any>({});
  const validate = (withdrawal: WithdrawalCreateModel) => {
    // console.log("Validating promotion: ", promotion);
    let tempErrors: any = {};
    if (withdrawalCreateModel.bankCode.length == 0)
      tempErrors.bankCode = "Vui lòng chọn ngân hàng";
    if (withdrawalCreateModel.amount < 50000)
      tempErrors.amount = "Vui lòng nhập số tiền từ 50.000đ";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const numericFields = ["amount"];
  const handleChange = (name: string, value: string) => {
    const newValue = numericFields.includes(name)
      ? Number(utilService.parseFormattedNumber(value))
      : value;

    if (isAnyRequestSubmit.current) {
      validate({
        ...withdrawalCreateModel,
        [name]: newValue,
      });
    }

    setWithdrawalCreateModel((prevPromotion) => ({
      ...prevPromotion,
      [name]: newValue,
    }));
    // console.log({
    //   ...promotion,
    //   [name]: newValue,
    // });
  };
  const handleSubmit = () => {
    isAnyRequestSubmit.current = true;
    if (validate(withdrawalCreateModel)) {
      // apiClient
      //   .post("shop-owner/promotion/create", submitPromotion)
      //   .then((res) => {
      //     let result = res.data as ValueResponse<{
      //       messsage: string;
      //       promotionInfo: PromotionModel;
      //     }>;
      //     if (result.isSuccess) {
      //       toast.show(`Hoàn tất tạo mới khuyến mãi thành công.`, {
      //         type: "success",
      //         duration: 1500,
      //       });
      //       // set to init
      //       globalPromotionState.setPromotion({
      //         ...result.value.promotionInfo,
      //       });
      //       router.replace("/promotion/details");
      //       isAnyRequestSubmit.current = false;
      //       setWithdrawalCreateModel({
      //         ...initPromotionSampleObject,
      //         bannerUrl: "",
      //       });
      //     }
      //   })
      //   .catch((error: any) => {
      //     Alert.alert(
      //       "Oops!",
      //       error?.response?.data?.error?.message ||
      //         "Yêu cầu bị từ chối, vui lòng thử lại sau!"
      //     );
      //   });
    } else {
      Alert.alert("Oops!", "Vui lòng hoàn thành thông tin một cách hợp lệ");
    }
  };
  return (
    <PageLayoutWrapper>
      <View className="p-4 bg-gray">
        <View className="flex flex-row gap-4">
          <View className="flex-1 flex flex-col">
            <View className="mb-2">
              <Text className="font-bold">Nhập số tiền *</Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 mt-1 px-3 pt-2 rounded text-[28px] pb-3"
                  placeholder="Nhập số tiền cần rút"
                  value={utilService.formatPrice(withdrawalCreateModel.amount)}
                  onChangeText={(text) => handleChange("amount", text)}
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <Text className="absolute right-3 top-6 text-[12.8px] italic">
                  VND
                </Text>
              </View>

              {errors.amount ? (
                <Text className="mt-1 text-red-500 text-xs">
                  {errors.amount}
                </Text>
              ) : (
                <Text className="mt-1 font-semibold text-gray-600 text-xs italic">
                  {withdrawalCreateModel.amount > 1000
                    ? utilService.capitalizeFirstChar(
                        utilService.numberToVietnameseText(
                          withdrawalCreateModel.amount
                        )
                      ) + " đồng"
                    : ""}
                </Text>
              )}
            </View>
            <CustomButton
              title="Gửi yêu cầu"
              containerStyleClasses="mt-5 bg-secondary h-12"
              textStyleClasses="text-white"
              handlePress={() => {
                handleSubmit();
              }}
            />
          </View>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default WithdrawalCreate;
