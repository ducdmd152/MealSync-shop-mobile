import AsyncStorage from "@react-native-async-storage/async-storage";
const sessionService = {
  getAuthToken: async () => {
    const token = await AsyncStorage.getItem("auth-token");
    return token;
  },
  setAuthToken: async (token: string) =>
    await AsyncStorage.setItem("auth-token", token),
  getAuthEmail: async () => {
    const token = await AsyncStorage.getItem("auth-email");
    return token;
  },
  setAuthEmail: async (email: string) =>
    await AsyncStorage.setItem("auth-email", email.trim().toLowerCase()),
  clear: () => {
    AsyncStorage.removeItem("auth-email");
    AsyncStorage.removeItem("auth-token");
  },
};

export default sessionService;
