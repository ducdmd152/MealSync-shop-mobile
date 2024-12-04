import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import sessionService from "../session-service";
export const BASE_URL = "https://api.1wolfalone1.com/api/v1/";
const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    console.log("Request Config:", config);
    if (!config.headers.Authorization) {
      const token = await sessionService.getAuthToken();
      // console.log("Token:", token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// apiClient.interceptors.response.use(
//   (response) => {
//     console.log("Response Data:", response.data); // Logs the response data
//     return response;
//   },
//   (error) => {
//     console.error("Response Error:", error.response || error.message); // Logs the error
//     return Promise.reject(error);
//   }
// );

export default apiClient;
