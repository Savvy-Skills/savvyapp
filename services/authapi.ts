import { useAuthStore } from "@/store/authStore";
import { LoginResponse, User } from "@/types";
import axios from "axios";

const api = axios.create({
  baseURL: "https://xfpf-pye0-4nzu.n7d.xano.io/api:_diHubFn",
});

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
	const data = { email, password };
    const response = await api.post<LoginResponse>("/auth/login/password", data);
    return response.data;
  } catch (error) {
    console.error("Error at login", error);
    return {} as LoginResponse;
  }
};

export const authme = async (): Promise<User> => {
  try {
    const response = await api.get<User>("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error at authme", error);
    return {} as User;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
