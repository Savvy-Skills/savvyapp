import axios from "axios";
import { apiConstants } from "@/constants/API";

type API = "auth" | "courses" | "oauth" | "openai";

export const createAPI = (API: API) => {
  const url =
    apiConstants.BASE_URL + apiConstants[API];
  const api = axios.create({
    baseURL: url,
    headers: {
      "Content-Type": "application/json",
	  "X-Data-Source": "live"
    },
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        // console.error("Unauthorized access. Redirecting to login...");
        // Use logout from authStore
      }
      return Promise.reject(error);
    }
  );

  return api;
};
