import axios from "axios";

export const createAPI = (baseURL: string) => {
  const api = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
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
