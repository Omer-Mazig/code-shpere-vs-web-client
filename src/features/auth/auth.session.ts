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
      const payload = response.data?.payload;
      const nextAccessToken = payload?.accessToken ?? null;
      const nextUser = payload?.user ?? null;
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
