import axios from "axios";
import {
  refreshAccessToken,
  setUnauthorizedHandler,
} from "@/features/auth/auth.session";

const baseURL = import.meta.env.VITE_API_URL ?? "";

export const apiClient = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let accessToken: string | null = null;
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export { setUnauthorizedHandler };

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";

    if (
      status !== 401 ||
      originalRequest?._retry ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await refreshAccessToken();
      const nextAccessToken = refreshResponse.accessToken;
      setAccessToken(nextAccessToken);

      pendingRequests.forEach((callback) => callback(nextAccessToken));
      pendingRequests = [];

      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      pendingRequests.forEach((callback) => callback(null));
      pendingRequests = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
