import { View, Text, Image, Alert } from "react-native";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import PageLayoutWrapper from "@/components/common/PageLayoutWrapper";
import FormFieldCustom from "@/components/custom/FormFieldCustom";
import { images } from "@/constants";
import CustomButton from "@/components/custom/CustomButton";
import CONSTANTS from "@/constants/data";
import apiClient from "@/services/api-services/api-client";
import { Link, router, useFocusEffect, useNavigation } from "expo-router";
import OTPTextView from "react-native-otp-textinput";
import { useToast } from "react-native-toast-notifications";
import Toast from "react-native-toast-message";
import sessionService from "@/services/session-service";
import utilService from "@/services/util-service";
import CustomModal from "@/components/common/CustomModal";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import { endpoints } from "@/services/api-services/api-service-instances";
import { FetchValueResponse } from "@/types/responses/FetchResponse";
import { ShopProfileGetModel } from "@/types/models/ShopProfileModel";

const EmailUpdate = () => {
  const navigation = useNavigation();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1. Verify old email 2. Enter new email 3. Verify new email
  const [data, setData] = useState({
    currentEmail: "",
    newEmail: "",
    currentEmailCode: 0,
    newEmailCode: 0,
  });

  const shopProfile = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.SHOP_PROFILE_FULL_INFO,
    async (): Promise<FetchValueResponse<ShopProfileGetModel>> =>
      apiClient
        .get(endpoints.SHOP_PROFILE_FULL_INFO)
        .then((response) => response.data),
    []
  );
  const [email, setEmail] = useState("--------------");
  useFocusEffect(
    React.useCallback(() => {
      shopProfile.refetch();
      if (shopProfile.isFetched && shopProfile.data?.value.email) {
        setData({ ...data, currentEmail: shopProfile.data?.value.email });
        requestSendCode(true);
      }
    }, [])
  );

  const requestSendCode = (isVerifyOldEmail: boolean) => {
    setIsSubmitting(true);
    apiClient
      .put(
        "shop-owner/update/email/send-verify",
        isVerifyOldEmail
          ? {
              isVerifyOldEmail,
            }
          : {
              isVerifyOldEmail,
              newEmail: data.newEmail,
            }
      )
      .then(() => {
        // no thing to do
      })
      .catch((error) => {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const checkVerifyCurrentEmail = (code: number = data.currentEmailCode) => {
    setIsSubmitting(true);
    apiClient
      .put("shop-owner/email/verify", {
        code: code,
      })
      .then(() => {
        toast.show(`Xác thực email hợp lệ.`, {
          type: "success",
          duration: 1500,
        });
        setStep(2);
      })
      .catch((error) => {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const updateNewEmail = (data: {
    currentEmail: string;
    newEmail: string;
    currentEmailCode: number;
    newEmailCode: number;
  }) => {
    setIsSubmitting(true);
    apiClient
      .put("shop-owner/email/update", {
        newEmail: data.newEmail.trim().toLowerCase(),
        codeVerifyOldEmail: data.currentEmailCode,
        CodeVerifyNewEmail: data.newEmailCode,
      })
      .then(async (response) => {
        const data = response.data as {
          value: {
            tokenAndInfor: {
              tokenResponse: {
                accessToken: string;
                refreshToken: string;
              };
            };
          };
        };
        await sessionService.setAuthToken(
          data.value.tokenAndInfor.tokenResponse.accessToken
        );
        console.log(
          "accessToken :",
          data.value.tokenAndInfor.tokenResponse.accessToken
        );
        router.back();

        Toast.show({
          type: "success",
          text1: "Hoàn tất",
          text2: `Cập nhật email thành công..`,
        });
        setStep(1);
      })
      .catch((error) => {
        Alert.alert(
          "Oops!",
          error?.response?.data?.error?.message ||
            "Yêu cầu bị từ chối, vui lòng thử lại sau!"
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const verifyCurrentEmail = (
    <View className="w-full p-4 pb-16">
      <EmailVerification
        handleSubmit={(code: number) => {
          setData({ ...data, currentEmailCode: code });
          checkVerifyCurrentEmail(code);
        }}
        isSubmitting={isSubmitting}
        onResendCode={() => {
          requestSendCode(true);
          setStep(3);
        }}
        limit={2 * 60}
        email={data.currentEmail}
      />
    </View>
  );
  const enterEmail = (
    <View className="w-full p-4 pb-16">
      <FormFieldCustom
        className="text-center mb-1"
        title={"Nhập email mới"}
        value={data.newEmail}
        placeholder={"Nhập email mới của bạn..."}
        handleChangeText={(text) => {
          setData({ ...data, newEmail: text });
        }}
        keyboardType="email-address"
        titleStyleClasses="text-center w-full mb-2"
        otherStyleClasses="mt-7"
        otherInputStyleClasses="text-center"
        otherTextInputStyleClasses="text-center"
      />
      <CustomButton
        title="Tiếp tục"
        handlePress={() => {
          if (!CONSTANTS.REGEX.email.test(data.newEmail.trim())) {
            Alert.alert("Vui lòng nhập email hợp lệ!");
            return;
          }
          requestSendCode(false);
          setStep(3);
        }}
        isDisabled={!CONSTANTS.REGEX.email.test(data.newEmail.trim())}
        containerStyleClasses="bg-primary w-full mt-7"
        textStyleClasses="text-white"
        isLoading={isSubmitting}
      />
      <CustomModal
        title="Xác thực email mới"
        isOpen={step == 3}
        setIsOpen={() => {
          if (step == 3) setStep(2);
          else setStep(3);
        }}
      >
        <EmailVerification
          handleSubmit={(code: number) => {
            setData({ ...data, newEmailCode: code });
            updateNewEmail({ ...data, newEmailCode: code });
          }}
          isSubmitting={isSubmitting}
          onResendCode={() => {
            console.log("Email submit: ", data);
            requestSendCode(false);
          }}
          limit={2 * 60}
          email={data.newEmail}
        />
      </CustomModal>
    </View>
  );
  const verifyNewEmail = <View className="w-full p-4 pb-16"></View>;
  const componentOfSteps: ReactNode[] = [
    verifyCurrentEmail,
    enterEmail,
    verifyNewEmail,
  ];

  const getCurrentStep = () => {
    return componentOfSteps[Math.min(1, step - 1)];
  };
  return (
    <PageLayoutWrapper>
      <View className="w-full h-full justify-center items-center p-4 ">
        <Image
          source={images.signInLogo1}
          resizeMode="contain"
          className="h-[80px]"
        />
        {/* <Text className="text-2xl text-gray text-semibold mt-10 font-semibold">
          
        </Text> */}
        <View className="w-full justify-center items-center shink-0">
          {getCurrentStep()}
        </View>
        <View className="justify-center items-center pt-2 gap-2 mt-2">
          <Text
            onPress={() => router.back()}
            className="text-lg text-black font-regular text-center text-white text-primary font-semibo"
          >
            Quay về tài khoản
          </Text>
        </View>
      </View>
    </PageLayoutWrapper>
  );
};

export default EmailUpdate;
const EmailVerification = ({
  email,
  limit,
  handleSubmit,
  onResendCode,
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
        Mã xác thực đã được gửi qua {email}
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
