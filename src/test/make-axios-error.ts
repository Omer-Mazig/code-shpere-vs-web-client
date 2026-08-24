import { AxiosError, type AxiosResponse } from "axios";

export function makeAxiosError(options: {
  status?: number;
  data?: unknown;
  code?: string;
} = {}): AxiosError {
  const error = new AxiosError("Request failed", options.code);

  if (options.code) {
    error.code = options.code;
  }

  if (options.status !== undefined) {
    error.response = {
      status: options.status,
      data: options.data,
      statusText: "",
      headers: {},
      config: {},
    } as AxiosResponse;
  }

  return error;
}
