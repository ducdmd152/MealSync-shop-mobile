import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import sessionService from "../session-service";
const apiClient = axios.create({
  baseURL: "https://my-json-server.typicode.com/duckodei/dsocial-json-server",
});

apiClient.interceptors.request.use(
  async (config) => {
    if (!config.headers.Authorization) {
      const token = await sessionService.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
