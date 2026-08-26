import { AUTH_PATHS, FEED_PATHS } from "@/lib/routes.constants";

/** Query / location-state key for the in-app path to restore after sign-in. */
export const RETURN_URL_QUERY_PARAM = "returnUrl";

/**
 * Decodes a single URI component. Returns `null` if the string is malformed
 * (`decodeURIComponent` throws) so callers can fall back to the raw value.
 */
function decodeOnce(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * True when `value` is an in-app relative path that cannot be used as an open
 * redirect. Must start with `/` (not `//`), and must not contain `\`, `://`,
 * or control characters.
 */
export function isSafeReturnUrl(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return false;
  }
  if (value.includes("\\") || value.includes("://")) {
    return false;
  }
  if (/[\u0000-\u001F\u007F]/.test(value)) {
    return false;
  }
  return true;
}

/**
 * Turns an untrusted return target into a path the app may navigate to.
 *
 * Decodes once (so `%2F%2Fevil.example` is caught), then requires
 * {@link isSafeReturnUrl}. Auth routes (`/auth/sign-in`, `/auth/sign-up`,
 * anything under `/auth/`) also fall back — sending the user back there after
 * login would loop.
 *
 * @param value - Query param, location state, or any unknown input
 * @param fallback - Used when `value` is missing or unsafe. Defaults to `/feed`
 */
export function sanitizeReturnUrl(
  value: unknown,
  fallback: string = FEED_PATHS.FEED,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  const decoded = decodeOnce(value.trim()) ?? value.trim();
  if (!isSafeReturnUrl(decoded)) {
    return fallback;
  }

  const pathOnly = decoded.split(/[?#]/, 1)[0] ?? decoded;
  if (
    pathOnly === AUTH_PATHS.SIGN_IN ||
    pathOnly === AUTH_PATHS.SIGN_UP ||
    pathOnly.startsWith(`${AUTH_PATHS.AUTH}/`)
  ) {
    return fallback;
  }

  return decoded;
}

/**
 * Reads `returnUrl` from the sign-in page: query string first, then React
 * Router location state. Both go through {@link sanitizeReturnUrl}.
 */
export function readReturnUrl(
  searchParams: { get: (name: string) => string | null },
  state: unknown,
): string {
  const fromQuery = searchParams.get(RETURN_URL_QUERY_PARAM);
  const fromState =
    state && typeof state === "object" && RETURN_URL_QUERY_PARAM in state
      ? (state as { returnUrl: unknown }).returnUrl
      : undefined;

  return sanitizeReturnUrl(fromQuery ?? fromState);
}

/**
 * Builds `/auth/sign-in?returnUrl=…` for a protected-route redirect.
 * Omits the query when `returnUrl` is missing or unsafe, so sign-in still
 * lands on `/feed` after login.
 */
export function signInPathWithReturnUrl(returnUrl: string): string {
  const safe = sanitizeReturnUrl(returnUrl, "");
  if (!safe) {
    return AUTH_PATHS.SIGN_IN;
  }

  const params = new URLSearchParams({
    [RETURN_URL_QUERY_PARAM]: safe,
  });
  return `${AUTH_PATHS.SIGN_IN}?${params.toString()}`;
}
