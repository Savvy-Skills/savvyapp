import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

export const createAPI = (baseURL:string) => {
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        console.error('Unauthorized access. Redirecting to login...');
        // Use logout from authStore
		useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );

  return api;
};