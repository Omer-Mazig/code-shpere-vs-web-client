import { apiClient } from "@/lib/api-client";
import type { AuthSession } from "./auth.types";

export type RegisterPayload = {
  email: string;
  password: string;
  username: string;
  displayName: string;
};

export const authApi = {
  login: async (email: string, password: string): Promise<AuthSession> => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthSession> => {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  refreshSession: async (): Promise<AuthSession> => {
    const response = await apiClient.post("/auth/refresh");
    return response.data;
  },
};
