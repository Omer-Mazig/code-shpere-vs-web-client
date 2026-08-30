import { apiClient, setAccessToken } from "@/lib/api-client";
import type { ApiEnvelope } from "@/lib/types";
import type {
  AuthSession,
  ChangePasswordDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  LoginDto,
  RegisterDto,
  RegisterResponseDto,
  ResendVerificationDto,
  ResendVerificationResponseDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
  VerifyEmailDto,
} from "./types";

export const authApi = {
  login: async (email: string, password: string): Promise<AuthSession> => {
    const loginPayload: LoginDto = { email, password };
    const response = await apiClient.post<ApiEnvelope<AuthSession>>(
      "/auth/login",
      loginPayload,
    );
    return response.data.payload;
  },

  register: async (payload: RegisterDto): Promise<RegisterResponseDto> => {
    const response = await apiClient.post<ApiEnvelope<RegisterResponseDto>>(
      "/auth/register",
      payload,
    );
    return response.data.payload;
  },

  verifyEmail: async (token: string): Promise<AuthSession> => {
    const payload: VerifyEmailDto = { token };
    const response = await apiClient.post<ApiEnvelope<AuthSession>>(
      "/auth/verify-email",
      payload,
    );
    return response.data.payload;
  },

  resendVerification: async (
    email: string,
  ): Promise<ResendVerificationResponseDto> => {
    const payload: ResendVerificationDto = { email };
    const response = await apiClient.post<
      ApiEnvelope<ResendVerificationResponseDto>
    >("/auth/resend-verification", payload);
    return response.data.payload;
  },

  forgotPassword: async (
    email: string,
  ): Promise<ForgotPasswordResponseDto> => {
    const payload: ForgotPasswordDto = { email };
    const response = await apiClient.post<ApiEnvelope<ForgotPasswordResponseDto>>(
      "/auth/forgot-password",
      payload,
    );
    return response.data.payload;
  },

  resetPassword: async (
    token: string,
    password: string,
  ): Promise<ResetPasswordResponseDto> => {
    const payload: ResetPasswordDto = { token, password };
    const response = await apiClient.post<ApiEnvelope<ResetPasswordResponseDto>>(
      "/auth/reset-password",
      payload,
    );
    return response.data.payload;
  },

  changePassword: async (dto: ChangePasswordDto): Promise<AuthSession> => {
    const response = await apiClient.post<ApiEnvelope<AuthSession>>(
      "/auth/change-password",
      dto,
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
