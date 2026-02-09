import { Query, QueryClient, QueryCache } from "@tanstack/react-query";
import { ZodError } from "zod";
import axios from "axios";
import { toast } from "sonner";

/**
 * Query client instance
 * @description Query client instance for the application
 * @returns {QueryClient} Query client instance
 */
export const queryClientInstance = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        toast.error(`Something went wrong: ${error.message}`);
      }

      if (import.meta.env.DEV) {
        console.error({ error, query });
      }
    },
  }),

  defaultOptions: {
    queries: {
      retry: (failureCount, error) => handleRetry(failureCount, error),
      throwOnError: (error, query) => handleThrowOnError(error, query),
    },

    mutations: {
      onError: (error, variables, context) => {
        if (import.meta.env.DEV) {
          console.error({ error, variables, context });
        }
      },
    },
  },
});

/**
 * Determines whether a failed query should be retried.
 *
 * Only transient errors are retried — network failures and server 5xx.
 * Client errors (4xx) and validation errors are deterministic: the
 * same request would produce the same failure, so retrying is pointless.
 */
export const handleRetry = (
  failureCount: number,
  error: unknown,
  retryLimit: number = 3,
): boolean => {
  if (failureCount >= retryLimit) return false;

  // Validation errors are deterministic — retrying won't help
  if (error instanceof ZodError) return false;

  if (axios.isAxiosError(error)) {
    // Request was cancelled (e.g., component unmounted) — don't retry
    if (error.code === "ERR_CANCELED") return false;

    const status = error.response?.status;

    // No response — network error (ECONNREFUSED, timeout, etc.), transient
    if (!status) return true;

    // 408 Request Timeout / 429 Too Many Requests — transient despite being 4xx
    if (status === 408 || status === 429) return true;

    // All other 4xx — client error, deterministic, won't resolve on retry
    if (status >= 400 && status < 500) return false;

    // 5xx — server error, transient
    return true;
  }

  // Unknown error type — retry in case it's transient
  return true;
};

/**
 * Handles throw on error logic for API calls.
 * @param error - The error object.
 * @param query - The query object.
 * @returns True if the call should be thrown, false otherwise.
 */
export const handleThrowOnError = (error: unknown, query: Query): boolean => {
  if (query.state.data !== undefined) {
    return false;
  }

  if (
    axios.isAxiosError(error) &&
    error.response?.status &&
    error.response.status >= 500
  ) {
    return true;
  }

  return false;
};
