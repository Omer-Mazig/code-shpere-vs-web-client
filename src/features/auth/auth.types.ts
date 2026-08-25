import type { components } from "@/lib/api-types";

export type AuthUser = components["schemas"]["AuthUserResponseDto"];
export type AuthSession = components["schemas"]["AuthSessionResponseDto"];

export type RegisterResult = {
  message: string;
  email: string;
  verificationUrl?: string;
};

export type ResendVerificationResult = {
  message: string;
  verificationUrl?: string;
};

export type ForgotPasswordResult = {
  message: string;
  resetUrl?: string;
};

export type ResetPasswordResult = {
  message: string;
};
