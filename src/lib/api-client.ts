import axios from "axios";
import {
  refreshAccessToken,
  setUnauthorizedHandler,
} from "@/features/auth/auth.session";
import { shouldAttemptTokenRefresh } from "./should-attempt-token-refresh";

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

export const getAccessToken = () => accessToken;

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
      !shouldAttemptTokenRefresh(
        status,
        Boolean(originalRequest?._retry),
        requestUrl,
      )
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
