import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthStorageDTO {
  email: string;
  token: string;
  role: number;
  isVerified: boolean;
}

const sessionService = {
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
    return role ? parseInt(role, 10) : null;
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

  setAuthStorageDTO: async (authDTO: AuthStorageDTO) => {
    await AsyncStorage.setItem(
      "auth-email",
      authDTO.email.trim().toLowerCase()
    );
    await AsyncStorage.setItem("auth-token", authDTO.token);
    await AsyncStorage.setItem("auth-role", authDTO.role.toString());
    await AsyncStorage.setItem(
      "auth-is-verified",
      authDTO.isVerified.toString()
    );
  },

  getAuthStorageDTO: async (): Promise<AuthStorageDTO | null> => {
    const email = await AsyncStorage.getItem("auth-email");
    const token = await AsyncStorage.getItem("auth-token");
    const role = await AsyncStorage.getItem("auth-role");
    const isVerified = await AsyncStorage.getItem("auth-is-verified");

    if (email && token && role && isVerified) {
      return {
        email,
        token,
        role: parseInt(role, 10),
        isVerified: isVerified === "true",
      };
    }
    return null;
  },

  clear: async () => {
    await AsyncStorage.removeItem("auth-email");
    await AsyncStorage.removeItem("auth-token");
    await AsyncStorage.removeItem("auth-role");
    await AsyncStorage.removeItem("auth-is-verified");
  },
};

export default sessionService;
