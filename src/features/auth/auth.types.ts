import type { components } from "@/lib/api-types";

export type AuthUser = components["schemas"]["AuthUserResponseDto"];
export type AuthSession = components["schemas"]["AuthSessionResponseDto"];
export type LoginDto = components["schemas"]["LoginDto"];
export type RegisterDto = components["schemas"]["RegisterDto"];
export type VerifyEmailDto = components["schemas"]["VerifyEmailDto"];
export type ResendVerificationDto =
  components["schemas"]["ResendVerificationDto"];
export type ForgotPasswordDto = components["schemas"]["ForgotPasswordDto"];
export type ResetPasswordDto = components["schemas"]["ResetPasswordDto"];
export type RegisterResponseDto = components["schemas"]["RegisterResponseDto"];
export type ResendVerificationResponseDto =
  components["schemas"]["ResendVerificationResponseDto"];
export type ForgotPasswordResponseDto =
  components["schemas"]["ForgotPasswordResponseDto"];
export type ResetPasswordResponseDto =
  components["schemas"]["ResetPasswordResponseDto"];
