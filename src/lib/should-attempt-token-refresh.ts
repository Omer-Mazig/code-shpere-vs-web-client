export function shouldAttemptTokenRefresh(
  status: number | undefined,
  alreadyRetried: boolean,
  requestUrl: string,
): boolean {
  if (status !== 401) return false;
  if (alreadyRetried) return false;
  if (requestUrl.includes("/auth/login")) return false;
  if (requestUrl.includes("/auth/refresh")) return false;
  return true;
}
