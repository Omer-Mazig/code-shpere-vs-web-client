import { getApiError } from "@/lib/errors";

export function getAuthErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const apiError = getApiError(error);

  if (
    apiError.statusCode === 429 ||
    apiError.errorCode === "RATE_LIMIT_EXCEEDED"
  ) {
    return "Too many attempts. Please try again later.";
  }

  if (apiError.errorCode === "EMAIL_VERIFICATION_TOKEN_EXPIRED") {
    return (
      apiError.message ??
      "This verification link has expired. Request a new one."
    );
  }

  if (apiError.errorCode === "EMAIL_VERIFICATION_TOKEN_INVALID") {
    return (
      apiError.message ??
      "This verification link is invalid or has already been used."
    );
  }

  if (apiError.errorCode === "PASSWORD_RESET_TOKEN_EXPIRED") {
    return (
      apiError.message ?? "This reset link has expired. Request a new one."
    );
  }

  if (apiError.errorCode === "PASSWORD_RESET_TOKEN_INVALID") {
    return (
      apiError.message ??
      "This reset link is invalid or has already been used."
    );
  }

  if (apiError.errorCode === "USER_EMAIL_EXISTS") {
    return "An account with this email already exists.";
  }

  if (apiError.errorCode === "USER_USERNAME_EXISTS") {
    return "This username is already taken.";
  }

  if (apiError.statusCode === 401) {
    return "Invalid credentials. Please try again.";
  }

  return apiError.message ?? fallback;
}
