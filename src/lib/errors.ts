import axios from "axios";
import type { ApiError } from "./types";

export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export type ParsedApiError = Partial<ApiError>;

function readValidationDetails(
  value: unknown,
): NonNullable<ApiError["details"]> | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const details = value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const field = "field" in item ? item.field : undefined;
    const message = "message" in item ? item.message : undefined;
    if (typeof field !== "string" || typeof message !== "string") {
      return [];
    }

    const trimmedField = field.trim();
    const trimmedMessage = message.trim();
    if (!trimmedField || !trimmedMessage) {
      return [];
    }

    return [{ field: trimmedField, message: trimmedMessage }];
  });

  return details.length > 0 ? details : undefined;
}

/**
 * User-facing message for failed requests and thrown errors.
 * Prefers the API envelope `message`, then `Error.message`, then `fallback`.
 */
export function getDisplayErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  const apiMessage = getApiError(error).message;
  if (apiMessage) {
    return apiMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getApiError(error: unknown): ParsedApiError {
  if (!axios.isAxiosError(error)) {
    return {};
  }

  const data = error.response?.data;
  if (!data || typeof data !== "object") {
    return { statusCode: error.response?.status };
  }

  const body = data as Record<string, unknown>;

  const details = readValidationDetails(body.details);

  return {
    statusCode:
      typeof body.statusCode === "number"
        ? body.statusCode
        : error.response?.status,
    errorCode:
      typeof body.errorCode === "string"
        ? (body.errorCode as ApiError["errorCode"])
        : undefined,
    message: typeof body.message === "string" ? body.message : undefined,
    ...(details ? { details } : {}),
  };
}
