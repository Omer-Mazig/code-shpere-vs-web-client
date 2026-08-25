import { apiClient, setAccessToken } from "@/lib/api-client";
import type { components } from "@/lib/api-types";
import type { ApiEnvelope } from "@/lib/types";
import type {
  AuthSession,
  RegisterResult,
  ResendVerificationResult,
  ForgotPasswordResult,
  ResetPasswordResult,
} from "./auth.types";

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

  register: async (payload: RegisterPayload): Promise<RegisterResult> => {
    const response = await apiClient.post<ApiEnvelope<RegisterResult>>(
      "/auth/register",
      payload,
    );
    return response.data.payload;
  },

  verifyEmail: async (token: string): Promise<AuthSession> => {
    const response = await apiClient.post<ApiEnvelope<AuthSession>>(
      "/auth/verify-email",
      { token },
    );
    return response.data.payload;
  },

  resendVerification: async (
    email: string,
  ): Promise<ResendVerificationResult> => {
    const response = await apiClient.post<
      ApiEnvelope<ResendVerificationResult>
    >("/auth/resend-verification", { email });
    return response.data.payload;
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResult> => {
    const response = await apiClient.post<ApiEnvelope<ForgotPasswordResult>>(
      "/auth/forgot-password",
      { email },
    );
    return response.data.payload;
  },

  resetPassword: async (
    token: string,
    password: string,
  ): Promise<ResetPasswordResult> => {
    const response = await apiClient.post<ApiEnvelope<ResetPasswordResult>>(
      "/auth/reset-password",
      { token, password },
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
