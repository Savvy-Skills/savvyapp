import axios from 'axios';
import { Module, ModuleWithSlides } from '../types';

const API_KEY = "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwiemlwIjoiREVGIn0.m_QhH24EpODsF1Y-zQUyvXb-HQWx92c0EiTdDrNUM8uW0BpWJVBiIPq-s766vHu0lUeCUEWuLXZ47SYqlseeFfZze-XnS1D1.8Fygb208PTYMdBL3_Yj50A.J-rTn0gSOJrdw34wRJOP9bQcg65XczI728U4R3xAq7oP3yQu-M6ZKBL_OlXxE8bMd_drJxp7QbWAxKCBaZ6uds6dqu43sDki5VfYkCIS-V2JzggIb--TbAdZxfPXZHnWNeMq86YkajBE5IWepiGdyg.CPd9FFNITF_jnOIYYxMYXXy0Rh_1w9UmhX7POmNlEv4";


const api = axios.create({
  baseURL: 'https://xfpf-pye0-4nzu.n7d.xano.io/api:edObfuQW',
});

export const fetchModules = async (): Promise<Module[]> => {
  const response = await api.get<Module[]>('/modules');
  return response.data;
};

export const fetchModuleById = async (id: number): Promise<ModuleWithSlides> => {
  const response = await api.get<ModuleWithSlides[]>(`/GetSlidesContentByModule?module_id=${id}`);
  return response.data[0];
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