import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@env";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Simple retry logic
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config;

    if (!config || config.__retryCount >= 2) {
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;
    config.__retryCount += 1;

    await new Promise((r) => setTimeout(r, 1000));
    return api(config);
  }
);
