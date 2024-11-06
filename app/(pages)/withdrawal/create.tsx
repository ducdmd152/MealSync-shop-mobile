import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import PromotionModel, {
  initPromotionSampleObject,
  PromotionApplyType,
  promotionApplyTypes,
} from "@/types/models/PromotionModel";
import dayjs from "dayjs";
import apiClient from "@/services/api-services/api-client";
import ValueResponse from "@/types/responses/ValueReponse";
import { useToast } from "react-native-toast-notifications";
import { router, useFocusEffect } from "expo-router";
import { Searchbar, Switch, TouchableRipple } from "react-native-paper";
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
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import { endpoints } from "@/services/api-services/api-service-instances";
import {
  BankInfoModel,
  BankListFetchResponse,
} from "@/types/models/BankFetchResponse";
import CustomMultipleSelectList from "@/components/custom/CustomMultipleSelectList";
import { BalanceModel } from "@/types/models/BalanceModel";
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
  bankCode: "ICB",
  bankShortName: "VietinBank",
  bankAccountNumber: "",
  verifyCode: 0,
};
const WithdrawalCreate = () => {
  const globalWithdrawalState = useGlobalWithdrawalState();
  const toast = useToast();
  const isAnyRequestSubmit = useRef(false);
  const [bankSearchText, setBankSearchText] = useState("");
  const [bankSearchList, setBankSearchList] = useState<BankInfoModel[]>([]);
  const [withdrawalCreateModel, setWithdrawalCreateModel] =
    useState<WithdrawalCreateModel>({
      ...initWithdrawSampleObject,
    });
  const bankListFetch = useFetchWithRQWithFetchFunc(
    [endpoints.EXTERNAL_BANK_LIST].concat(["withdrawal-create-page"]),
    async (): Promise<BankListFetchResponse> =>
      apiClient
        .get(endpoints.EXTERNAL_BANK_LIST)
        .then((response) => response.data),
    []
  );
  const balanceFetch = useFetchWithRQWithFetchFunc(
    [endpoints.BALANCE].concat(["withdrawal-create-page"]),
    async (): Promise<ValueResponse<BalanceModel>> =>
      apiClient.get(endpoints.BALANCE).then((response) => response.data),
    []
  );
  useEffect(() => {
    const text = bankSearchText.trim().toLocaleLowerCase();
    if (!bankListFetch.isFetching && bankListFetch.isSuccess)
      setBankSearchList(
        bankListFetch?.data?.data.filter(
          (bank) =>
            bank.name.toLocaleLowerCase().includes(text) ||
            bank.shortName.toLocaleLowerCase().includes(text)
        ) || []
      );
  }, [bankListFetch.isFetching, bankSearchText]);
  // console.log(bankListFetch.data);
  const getBankCode = (id: number) => {
    return bankListFetch?.data?.data.find((item) => item.id === id)?.code || "";
  };
  const getBankShortName = (id: number) => {
    return (
      bankListFetch?.data?.data.find((item) => item.id === id)?.shortName || ""
    );
  };
  const getBankName = (code: string) => {
    return (
      bankListFetch?.data?.data.find((item) => item.code === code)?.name || ""
    );
  };
  useFocusEffect(
    React.useCallback(() => {
      balanceFetch.refetch();
      bankListFetch.refetch();
    }, [])
  );
  const [errors, setErrors] = useState<any>({});
  const validate = (withdrawal: WithdrawalCreateModel) => {
    // console.log("Validating promotion: ", promotion);
    let tempErrors: any = {};
    if (withdrawal.amount < 50000) {
      // console.log(withdrawal.amount, withdrawal.amount < 50000);
      tempErrors.amount = "Vui lòng nhập số tiền từ 50.000đ";
    }
    if (withdrawal.bankCode.length == 0)
      tempErrors.bankCode = "Vui lòng chọn ngân hàng";
    if (withdrawal.bankAccountNumber.length == 0)
      tempErrors.bankAccountNumber = "Vui nhập số tài khoản";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const numericFields = ["amount"];
  const handleChange = (name: string, value: string) => {
    const newValue = numericFields.includes(name)
      ? Number(utilService.parseFormattedNumber(value))
      : value;
    // console.log(value, utilService.parseFormattedNumber(value), newValue);

    if (isAnyRequestSubmit.current) {
      validate({
        ...withdrawalCreateModel,
        [name]: newValue,
      });
    }

    setWithdrawalCreateModel({
      ...withdrawalCreateModel,
      [name]: newValue,
    });
    // console.log({
    //   ...promotion,
    //   [name]: newValue,
    // });
  };
  const handleSubmit = (isVerified: boolean = false) => {
    isAnyRequestSubmit.current = true;
    if (!validate(withdrawalCreateModel)) {
      Alert.alert("Oops!", "Vui lòng hoàn thành thông tin hợp lệ");
      return;
    }

    if (!isVerified) {
      apiClient
        .post("shop-owner/withdrawal/send-verify-code", withdrawalCreateModel)
        .then((res) => {
          let result = res.data as ValueResponse<{
            email: string;
            messsage: string;
          }>;

          if (result.isSuccess) {
            // open verify modal
          }
        })
        .catch((error: any) => {
          console.log("error 1: ", error?.response?.data);
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!"
          );
        });
    } else {
      apiClient
        .post("shop-owner/withdrawal", withdrawalCreateModel)
        .then((res) => {
          let result = res.data as ValueResponse<{
            email: string;
            messsage: string;
          }>;
          if (result.isSuccess) {
            toast.show(`Yêu cầu đã được gửi thành công.`, {
              type: "success",
              duration: 1500,
            });
            // set to init
            router.replace("/shop/withdrawal");
            isAnyRequestSubmit.current = false;
            setWithdrawalCreateModel({ ...initWithdrawSampleObject });
          }
        })
        .catch((error: any) => {
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!"
          );
        });
    }
  };

  return (
    <PageLayoutWrapper>
      <View className="p-4 bg-gray">
        <View className="flex flex-row gap-4">
          <View className="flex-1 flex flex-col">
            <View className="mb-2">
              <Text className="font-bold">Số dư có sẵn</Text>
              <TextInput
                className="border-0 border-gray-300 py-2 rounded text-[20px]"
                value={`${
                  balanceFetch.data?.value.availableAmount
                    ? utilService.formatPrice(
                        balanceFetch.data?.value.availableAmount
                      )
                    : "----------"
                }₫`}
                readOnly
                placeholderTextColor="#888"
              />
            </View>
            <View className="mb-2">
              <Text className="font-bold">Nhập số tiền cần rút *</Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 mt-1 px-3 pt-2 rounded text-[28px] pb-3"
                  placeholder="Nhập số tiền cần rút"
                  value={utilService.formatPrice(withdrawalCreateModel.amount)}
                  onChangeText={(text) => {
                    // console.log("text: " + text);
                    handleChange("amount", text);
                  }}
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
            <View className="mb-2">
              <Text className="font-bold">Ngân hàng và tài khoản của bạn</Text>
              <View className="mt-2">
                {/* <SelectList
                  setSelected={(value: string | number) =>
                    setWithdrawalCreateModel({
                      ...withdrawalCreateModel,
                      bankCode: getBankCode(Number(value)),
                      bankShortName: getBankShortName(Number(value)),
                    })
                  }
                  data={
                    (bankListFetch?.data?.data || []).map((item) => ({
                      key: item.id.toString(),
                      value: item.shortName,
                    })) || []
                  }
                  save="key"
                  notFoundText="Không tìm thấy"
                  placeholder="Chọn ngân hàng tài khoản của bạn"
                  searchPlaceholder="Tìm kiếm..."
                /> */}
                <Searchbar
                  style={{
                    height: 40,
                    backgroundColor: "white",
                    borderColor: "lightgray",
                    borderWidth: 1,
                    // borderRadius: "12px",
                  }}
                  inputStyle={{ minHeight: 0, color: "#1f2937" }}
                  placeholderTextColor="#9ca3af"
                  placeholder="Nhập tên ngân hàng..."
                  onChangeText={setBankSearchText}
                  value={bankSearchText}
                />
                <ScrollView
                  style={{ width: "100%", flexShrink: 0 }}
                  horizontal={true}
                >
                  <View className="w-full flex-row gap-x-3 items-center justify-between pb-2 mt-3">
                    {bankSearchList.map((bank, index) => (
                      <TouchableOpacity
                        key={bank.id}
                        onPress={() => {
                          setWithdrawalCreateModel({
                            ...withdrawalCreateModel,
                            bankCode: bank.code,
                            bankShortName: bank.shortName,
                          });
                        }}
                      >
                        <View
                          className={`p-[1px] border-[1px] border-[#bbf7d0] rounded-full ${
                            bank.code == withdrawalCreateModel.bankCode
                              ? "border-[2px] border-[#06b6d4]"
                              : ""
                          }`}
                        >
                          <Image
                            source={{ uri: bank.logo }}
                            resizeMode="contain"
                            className="h-[42px] w-[42px]  opacity-85"
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
            <View className="mb-2">
              <Text className="font-bold">Ngân hàng *</Text>
              <TextInput
                className="border border-gray-300 mt-1 p-2 rounded text-[16px]"
                placeholder="Vui lòng chọn ngân hàng"
                value={getBankName(withdrawalCreateModel.bankCode)}
                readOnly
                placeholderTextColor="#888"
              />
              {errors.title && (
                <Text className="text-red-500 text-xs">{errors.title}</Text>
              )}
            </View>
            <View className="mb-2">
              <Text className="font-bold">Số tài khoản *</Text>
              <TextInput
                className="border border-gray-300 mt-1 p-2 px-3 rounded text-[20px]"
                placeholder="Nhập số tài khoản..."
                value={withdrawalCreateModel.bankAccountNumber}
                placeholderTextColor="#888"
                // readOnly
                onChangeText={(text) => {
                  // console.log("text: " + text);
                  handleChange("bankAccountNumber", text);
                }}
              />
              {errors.bankAccountNumber && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.bankAccountNumber}
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
