import { apiClient } from "@/lib/api-client";

export type RefreshResult = {
  accessToken: string | null;
  user: unknown | null;
};

let refreshPromise: Promise<RefreshResult> | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

export const refreshAccessToken = async (): Promise<RefreshResult> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = apiClient
    .post("/auth/refresh")
    .then((response) => {
      const nextAccessToken = response.data?.accessToken ?? null;
      const nextUser = response.data?.user ?? null;
      return { accessToken: nextAccessToken, user: nextUser };
    })
    .catch((error) => {
      unauthorizedHandler?.();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};
