import { Module, ModuleWithSlides } from "../types";
import { useAuthStore } from "@/store/authStore";
import { createAPI } from "./apiConfig";

const baseURL = "https://xfpf-pye0-4nzu.n7d.xano.io/api:edObfuQW";
export const module_api = createAPI(baseURL);

export const fetchModules = async (): Promise<Module[]> => {
  try {
    const response = await module_api.get<Module[]>("/modules");
    return response.data;
  } catch (error) {
    console.error("Error fetching modules", error);
    return [];
  }
};

export const fetchModuleById = async (
  id: number
): Promise<ModuleWithSlides> => {
  try {
    const response = await module_api.get<ModuleWithSlides[]>(
      `/GetSlidesContentByModule?module_id=${id}`
    );
    return response.data[0];
  } catch (error) {
    console.error("Error fetching module", error);
    return {} as ModuleWithSlides;
  }
};

module_api.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "multipart/form-data";
    return config;
  },
  (error) => {
    // Do something with request error
    console.error("Request error", error);
    return Promise.reject(error);
  }
);
