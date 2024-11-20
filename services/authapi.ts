import { LoginResponse, User } from "@/types";
import { createAPI } from "./apiConfig";

export const authAPI = createAPI("auth");

console.log({authAPI})

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const data = { email, password };
    const response = await authAPI.post<LoginResponse>(
      "/auth/login/password",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error at login", error);
    return {} as LoginResponse;
  }
};

export const authme = async (token: string): Promise<User> => {
  try {
	authAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await authAPI.get<User>("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error at authme", error);
    return {} as User;
  }
};
