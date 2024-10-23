import axios from "axios";
import { Module, ModuleWithSlides } from "../types";

const API_KEY =
  "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwiemlwIjoiREVGIn0.tTZwdZtgYjIwV0DxyXJay8ce-9bNUFT1n2Lm32toAxcV6zXVtv8VwgNprYFhMMBppSJ40N_EtPuD_6YaV24kUz82F0N7PE7f.Q5LJ7s3W1BIJnTuVZwUpzg.LyhkCW3r_DV1BndwwVlIRF_03OpfQNKJ44n-gjvUGe1GpHv3JX_6zy3Z8ExzUwVHQ2noJ7NaJxLBacS2P2XmAbgv5xVMVNWOnvzpsX6FwctcSC2vEaSsRnBchb2fH64gmkrniiXt-s1VIUKwBofrNg.0C7D9zPqaiBRB0U8zqh9IDwv2pH9o5D_FvyCz5MGjFQ";

const api = axios.create({
  baseURL: "https://xfpf-pye0-4nzu.n7d.xano.io/api:edObfuQW",
});

export const fetchModules = async (): Promise<Module[]> => {
  try {
    const response = await api.get<Module[]>("/modules");
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
    const response = await api.get<ModuleWithSlides[]>(
      `/GetSlidesContentByModule?module_id=${id}`
    );
    return response.data[0];
  } catch (error) {
    console.error("Error fetching module", error);
    return {} as ModuleWithSlides;
  }
};

api.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    config.headers["Authorization"] = "Bearer " + API_KEY;
    config.headers["Content-Type"] = "multipart/form-data";
    return config;
  },
  (error) => {
    // Do something with request error
    console.error("Request error", error);
    return Promise.reject(error);
  }
);
