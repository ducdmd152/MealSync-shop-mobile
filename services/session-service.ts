import AsyncStorage from "@react-native-async-storage/async-storage";
const sessionService = {
  getAuthToken: async () => {
    const token = await AsyncStorage.getItem("token");
    return token;
  },
};

export default sessionService;
