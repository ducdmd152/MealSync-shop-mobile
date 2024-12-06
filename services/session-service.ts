import AuthDTO from "@/types/dtos/AuthDTO";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient, { BASE_URL } from "./api-services/api-client";
const handleRegistrationDevice = async (token: string) => {
  try {
    console.log("Registration device token", token);

    const response = await fetch(BASE_URL + "auth/device-token", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await sessionService.getAuthToken()}`,
      },
      body: JSON.stringify({ deviceToken: token }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data, "successfully registered device");
  } catch (err) {
    console.error(err, "cannot register device");
  }
};

export interface AuthStorageDTO {
  email: string;
  token: string;
  role: number;
  isVerified: boolean;
}

const sessionService = {
  handleRegistrationDevice,
  getAuthToken: async () => {
    const token = await AsyncStorage.getItem("auth-token");
    return token;
  },
  setAuthToken: async (token: string) => {
    await AsyncStorage.setItem("auth-token", token);
  },
  getAuthEmail: async () => {
    const email = await AsyncStorage.getItem("auth-email");
    return email;
  },
  setAuthEmail: async (email: string) => {
    await AsyncStorage.setItem("auth-email", email.trim().toLowerCase());
  },
  getAuthRole: async () => {
    const role = await AsyncStorage.getItem("auth-role");
    return parseInt(role || "", 10);
  },
  setAuthRole: async (role: number) => {
    await AsyncStorage.setItem("auth-role", role.toString()); // 2: Shop Owner, 3: Shop Delivery Staff
  },
  isVerified: async () => {
    const isVerified = await AsyncStorage.getItem("auth-is-verified");
    return isVerified === "true";
  },
  setIsVerified: async (isVerified: boolean) => {
    await AsyncStorage.setItem("auth-is-verified", isVerified.toString());
  },

  getAuthDTO: async () => {
    const authDTOString = await AsyncStorage.getItem("authDTO");
    try {
      return authDTOString ? (JSON.parse(authDTOString) as AuthDTO) : null;
    } catch (error) {
      console.error("Failed to parse authDTO:", error);
      return null;
    }
  },
  setAuthDTO: async (authDTO: AuthDTO) => {
    await AsyncStorage.setItem(
      "authDTO",
      authDTO ? JSON.stringify(authDTO) : "",
    );
  },

  clear: async () => {
    await handleRegistrationDevice("string");
    await AsyncStorage.removeItem("auth-email");
    await AsyncStorage.removeItem("auth-token");
    await AsyncStorage.removeItem("auth-role");
    await AsyncStorage.removeItem("authDTO");
    await AsyncStorage.removeItem("auth-is-verified");
  },
};

export default sessionService;
