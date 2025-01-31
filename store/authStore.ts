import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import { login, authme, authAPI } from "../services/authapi";
import { courses_api } from "@/services/coursesApi";
import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

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
	error: string | null;
	logout: () => void;
	getUser: () => Promise<void>;
	isInitialized: boolean;
	setInitialized: () => void;
	setToken: (token: string) => Promise<void>;
	setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			token: null,
			user: null,
			isLoading: false,
			error: null,
			setError: (error: string | null) => {
				set({ error });
			},
			isInitialized: false,
			setToken: async (token: string) => {
				setTokenInterceptors(authAPI, token);
				setTokenInterceptors(courses_api, token);
				set({ token });
				await get().getUser();
			},
			login: async (email: string, password: string) => {
				set({ isLoading: true });
				try {
					const data = await login(email, password);
					setTokenInterceptors(authAPI, data.auth_token);
					setTokenInterceptors(courses_api, data.auth_token);
					set({ token: data.auth_token });
					await get().getUser();
				} catch (error) {
					console.error("Login error:", error);
					set({ isLoading: false, error: "Invalid email or password" });
				}
			},
			logout: async () => {
				try {
					set({ token: null, user: null });
					if (Platform.OS !== "web") {
						await GoogleSignin.signOut();
					}
				} catch (error) {
					console.error("Logout error:", error);
				}
			},
			getUser: async () => {
				set({ isLoading: true });
				const token = get().token;
				if (token) {
					try {
						const data = await authme(token);
						set({ user: data, isLoading: false });
					} catch (error) {
						console.error("Get user error:", error);
						set({ isLoading: false, error: "Invalid token" });
					}
				}
			},
			setInitialized: () => {
				setUnauthorizedInterceptor(authAPI);
				setUnauthorizedInterceptor(courses_api);
				set({ isInitialized: true });
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => crossPlatformStorage),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.setInitialized();
					if (state.error) {
						state.setError(null);
					}
					const token = state.token;
					if (token) {
						setTokenInterceptors(authAPI, token);
						setTokenInterceptors(courses_api, token);
					}
				}
			},
		}
	)
);

function setTokenInterceptors(api: any, token: string) {
	// Clean previous interceptors
	api.interceptors.request.handlers = [];

	function addAuthorization(config: any) {
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	}

	function handleError(error: any) {
		return Promise.reject(error);
	}

	api.interceptors.request.use(addAuthorization, handleError);
}

function setUnauthorizedInterceptor(api: any) {
	function onError(error: any) {
		if (error.response.status === 401) {
			useAuthStore.getState().logout();
		}
		return Promise.reject(error);
	}

	api.interceptors.response.use((response: any) => {
		return response;
	}, onError);
}
