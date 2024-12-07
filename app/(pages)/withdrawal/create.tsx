import CustomModal from "@/components/common/CustomModal";
import CustomButton from "@/components/custom/CustomButton";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import useGlobalWithdrawalState from "@/hooks/states/useGlobalWithdrawalState";
import apiClient from "@/services/api-services/api-client";
import { endpoints } from "@/services/api-services/api-service-instances";
import utilService from "@/services/util-service";
import { BalanceModel } from "@/types/models/BalanceModel";
import {
  BankInfoModel,
  BankListFetchResponse,
} from "@/types/models/BankFetchResponse";
import { WITHDRAW_STATUSES_FILTER } from "@/types/models/WithdrawalModel";
import ValueResponse from "@/types/responses/ValueReponse";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import OTPTextView from "react-native-otp-textinput";
import { Searchbar } from "react-native-paper";
import { useToast } from "react-native-toast-notifications";

interface WithdrawalCreateModel {
  amount: number;
  bankCode: string;
  bankAccountName: string;
  bankShortName: string;
  bankAccountNumber: string;
  verifyCode: number;
  email: string;
}
const initWithdrawSampleObject = {
  amount: 0,
  bankCode: "ICB",
  bankAccountName: "",
  bankShortName: "VietinBank",
  bankAccountNumber: "",
  verifyCode: 0,
  email: "",
};
const WithdrawalCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const globalWithdrawalState = useGlobalWithdrawalState();
  const toast = useToast();
  const isAnyRequestSubmit = useRef(false);
  const [bankSearchText, setBankSearchText] = useState("");

  const [bankSearchList, setBankSearchList] = useState<BankInfoModel[]>([]);
  const [withdrawalCreateModel, setWithdrawalCreateModel] =
    useState<WithdrawalCreateModel>({
      ...initWithdrawSampleObject,
    });
  const [isUnderKeywodFocusing, setIsUnderKeywodFocusing] = useState(false);
  const [isVerifing, setIsVerifing] = useState(false);
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
      isAnyRequestSubmit.current = false;
      setWithdrawalCreateModel({ ...initWithdrawSampleObject });
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
    if (withdrawal.bankAccountName.length == 0)
      tempErrors.bankAccountName = "Vui nhập tên chủ tài khoản";

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
  const handleSubmit = (
    withdrawal: WithdrawalCreateModel,
    isVerified: boolean = false
  ) => {
    isAnyRequestSubmit.current = true;
    if (!validate(withdrawalCreateModel)) {
      Alert.alert("Oops!", "Vui lòng hoàn thành thông tin hợp lệ");
      return;
    }

    if (!isVerified) {
      setIsSubmitting(true);
      apiClient
        .post("shop-owner/withdrawal/send-verify-code", withdrawal)
        .then((res) => {
          let result = res.data as ValueResponse<{
            email: string;
            messsage: string;
          }>;

          if (result.isSuccess) {
            setWithdrawalCreateModel({
              ...withdrawal,
              email: result.value.email,
            });
            setIsVerifing(true);
          }
        })
        .catch((error: any) => {
          balanceFetch.refetch();
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!"
          );
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      apiClient
        .post("shop-owner/withdrawal", {
          ...withdrawal,
          email: undefined,
        })
        .then((res) => {
          setIsVerifing(false);
          globalWithdrawalState.setStatuses(WITHDRAW_STATUSES_FILTER[0].value);
          router.back();
          toast.show(`Yêu cầu đã được gửi thành công.`, {
            type: "success",
            duration: 1500,
          });
        })
        .catch((error: any) => {
          console.log("Verified Error: ", error?.response?.data);
          Alert.alert(
            "Oops!",
            error?.response?.data?.error?.message ||
              "Yêu cầu bị từ chối, vui lòng thử lại sau!"
          );
        });
    }
  };

  useEffect(() => {
    if (!balanceFetch.isFetching && isAnyRequestSubmit.current) {
      validate(withdrawalCreateModel);
    }
  }, [balanceFetch.isFetching]);

  useEffect(() => {
    // console.log(isUnderKeywodFocusing);
    if (isUnderKeywodFocusing && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isUnderKeywodFocusing, scrollViewRef]);
  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <ScrollView
        ref={scrollViewRef}
        refreshControl={
          <RefreshControl
            tintColor={"#FCF450"}
            onRefresh={() => {
              balanceFetch.refetch();
              bankListFetch.refetch();
            }}
            refreshing={balanceFetch.isFetching || bankListFetch.isFetching}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 flex-grow p-4 bg-gray">
          <View
            className={`flex-1 flex-row gap-4 ${
              isUnderKeywodFocusing && "pb-[160px]"
            }`}
          >
            <View className="flex-1 flex flex-col">
              <View className="mb-2">
                <Text className="font-bold">Số dư có sẵn</Text>
                <TextInput
                  className="border-0 border-gray-300 py-2 rounded text-[20px]"
                  value={`${
                    balanceFetch.data?.value?.availableAmount
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
                <Text className="font-bold">Số tiền cần rút *</Text>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 mt-1 px-3 pt-2 rounded text-[28px] pb-3"
                    placeholder="Nhập số tiền cần rút"
                    value={utilService.formatPrice(
                      withdrawalCreateModel.amount
                    )}
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
                <Text className="font-bold">
                  Ngân hàng và tài khoản của bạn
                </Text>
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
                  keyboardType="numeric"
                  onFocus={() => setIsUnderKeywodFocusing(true)}
                  onBlur={() => setIsUnderKeywodFocusing(false)}
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
              <View className="mb-2">
                <Text className="font-bold">Tên chủ tài khoản *</Text>
                <TextInput
                  className="border border-gray-300 mt-1 p-2 px-3 rounded text-[20px]"
                  placeholder="Nhập tên chủ tài khoản..."
                  keyboardType="numeric"
                  onFocus={() => setIsUnderKeywodFocusing(true)}
                  onBlur={() => setIsUnderKeywodFocusing(false)}
                  value={withdrawalCreateModel.bankAccountName}
                  placeholderTextColor="#888"
                  // readOnly
                  onChangeText={(text) => {
                    // console.log("text: " + text);
                    handleChange("bankAccountName", text);
                  }}
                />
                {errors.bankAccountName && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.bankAccountName}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <CustomButton
            title="Gửi yêu cầu"
            containerStyleClasses="mt-5 bg-secondary h-12"
            textStyleClasses="text-white"
            isLoading={isSubmitting}
            handlePress={() => {
              handleSubmit(withdrawalCreateModel);
            }}
          />
        </View>
        <CustomModal
          title="Xác thực yêu cầu rút tiền"
          isOpen={isVerifing}
          setIsOpen={setIsVerifing}
        >
          {/* <Text className="text-gray-800 text-center">
            Vui lòng kiểm tra email (
            <Text className="font-semibold">
              {utilService.hideEmailMiddle(withdrawalCreateModel.email)})
            </Text>{" "}
            {"\n"} của bạn và hoàn thành mã xác thực
          </Text> */}
          <WithdrawalVerification
            isSubmitting={isSubmitting}
            email={withdrawalCreateModel.email}
            limit={2 * 60}
            onResendCode={() => {
              handleSubmit(withdrawalCreateModel);
            }}
            handleSubmit={(code: number) => {
              handleSubmit(
                {
                  ...withdrawalCreateModel,
                  verifyCode: code,
                },
                true
              );
            }}
          />
        </CustomModal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WithdrawalCreate;

const WithdrawalVerification = ({
  email,
  limit,
  handleSubmit,
  onResendCode,
  isSubmitting,
}: {
  email: string;
  limit: number;
  handleSubmit: (code: number) => void;
  onResendCode: () => void;
  isSubmitting: boolean;
}) => {
  const intervalIdRef = useRef<any>(null);
  const [timeSecondsCounter, setTimeSecondsCounter] = useState(0);
  const lengthOfCode = 4;
  const [code, setCode] = useState("");
  const otpInput = useRef<OTPTextView | null>(null);

  const clearText = () => {
    if (otpInput.current) {
      otpInput.current.clear();
    }
  };
  useEffect(() => {
    if (code.length == lengthOfCode) handleSubmit(Number(code));
  }, [code]);
  const resetTimeCounter = () => {
    setTimeSecondsCounter(limit);
    const intervalId = setInterval(() => {
      setTimeSecondsCounter((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1010);
    intervalIdRef.current = intervalId;
  };
  useFocusEffect(
    React.useCallback(() => {
      resetTimeCounter();
    }, [])
  );

  return (
    <View className="mt-4">
      <Text className="text-lg text-gray-500 text-center text-semibold mt-2 font-semibold">
        Mã xác thực đã được gửi qua {utilService.hideEmailMiddle(email)}
      </Text>
      <Text className="text-lg text-gray-500 text-center text-semibold mt-2">
        Thời gian còn lại{" "}
        {Math.floor(timeSecondsCounter / 60)
          .toString()
          .padStart(2, "0") +
          " : " +
          (timeSecondsCounter % 60).toString().padStart(2, "0")}
      </Text>
      <OTPTextView
        inputCount={lengthOfCode}
        ref={otpInput}
        handleTextChange={(text) => {
          setCode(text);
        }}
      />
      {/* <CustomButton
        title="Xác thực"
        handlePress={() => onVerify()}
        containerStyleClasses="min-h-[52px] mt-6 bg-primary"
        textStyleClasses="text-[16px] text-white"
      /> */}
      {/* <CustomButton
        title="Nhập lại"
        handlePress={clearText}
        containerStyleClasses="min-h-[52px] mt-4 border-[1px] border-gray-600 bg-white"
        textStyleClasses="text-[16px] text-gray-600"
      /> */}
      <CustomButton
        // isLoading={isSubmitting}
        title="Nhận mã mới"
        handlePress={() => {
          clearText();
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
          resetTimeCounter();
          onResendCode();
        }}
        containerStyleClasses="h-[40px] mt-4 border-[1px] border-gray-300 bg-white"
        textStyleClasses="text-[16px] text-gray-600 font-medium"
      />
    </View>
  );
};
