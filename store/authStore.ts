import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import { login, authme, authAPI } from "../services/authapi";
import { Platform } from "react-native";

// Create a cross-platform storage object
const crossPlatformStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(name);
    } else {
      return AsyncStorage.getItem(name);
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(name, value);
    } else {
      await AsyncStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(name);
    } else {
      await AsyncStorage.removeItem(name);
    }
  },
};

interface AuthStore {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getUser: () => Promise<void>;
  isInitialized: boolean;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      isInitialized: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const data = await login(email, password);
          set({ token: data.token, isLoading: false });
          await get().getUser();
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          throw error;
        }
      },
      logout: () => {
        set({ token: null, user: null });
      },
      getUser: async () => {
        set({ isLoading: true });
        try {
          const data = await authme();
          set({ user: data, isLoading: false });
        } catch (error) {
          console.error("Get user error:", error);
          set({ isLoading: false });
          throw error;
        }
      },
      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => crossPlatformStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setInitialized();
		  authAPI.interceptors.request.use(
			(config) => {
			  const token = state.token
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
        }
      },
    }
  )
);
