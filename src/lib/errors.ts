import axios from "axios";

export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export type ParsedApiError = {
  statusCode?: number;
  errorCode?: string;
  message?: string;
};

export function getApiError(error: unknown): ParsedApiError {
  if (!axios.isAxiosError(error)) {
    return {};
  }

  const data = error.response?.data;
  if (!data || typeof data !== "object") {
    return { statusCode: error.response?.status };
  }

  const body = data as {
    statusCode?: number;
    errorCode?: string;
    message?: string;
  };

  return {
    statusCode: body.statusCode ?? error.response?.status,
    errorCode: body.errorCode,
    message: body.message,
  };
}
