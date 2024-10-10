import AsyncStorage from "@react-native-async-storage/async-storage";
const sessionService = {
  getAuthToken: async () => {
    const token = await AsyncStorage.getItem("auth-token");
    return token;
  },
  setAuthToken: (token: string) => AsyncStorage.setItem("auth-token", token),
};

export default sessionService;
