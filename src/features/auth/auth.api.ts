import { apiClient, setAccessToken } from "@/lib/api-client";
import type { components } from "@/lib/api-types";
import type { ApiEnvelope } from "@/lib/types";
import type { AuthSession } from "./auth.types";

export type RegisterPayload = components["schemas"]["RegisterDto"];

export const authApi = {
  login: async (email: string, password: string): Promise<AuthSession> => {
    const loginPayload: components["schemas"]["LoginDto"] = { email, password };
    const response = await apiClient.post<ApiEnvelope<AuthSession>>(
      "/auth/login",
      loginPayload,
    );
    return response.data.payload;
  },

  register: async (payload: RegisterPayload): Promise<AuthSession> => {
    const response = await apiClient.post<ApiEnvelope<AuthSession>>(
      "/auth/register",
      payload,
    );
    return response.data.payload;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  refreshSession: async (): Promise<AuthSession> => {
    const response = await apiClient.post<ApiEnvelope<AuthSession>>(
      "/auth/refresh",
    );
    const session = response.data.payload;
    if (session?.accessToken) {
      setAccessToken(session.accessToken);
    }
    return session;
  },
};
