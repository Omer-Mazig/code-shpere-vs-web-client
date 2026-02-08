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
 * Handles retry logic for API calls.
 * @param failureCount - The number of times the call has failed.
 * @param error - The error object.
 * @param retryLimit - The maximum number of retries.
 * @returns True if the call should be retried, false otherwise.
 */
export const handleRetry = (
  failureCount: number,
  error: unknown,
  retryLimit: number = 3,
): boolean => {
  if (failureCount >= retryLimit) {
    return false;
  }

  if (error instanceof ZodError) {
    return false;
  }

  if (
    axios.isAxiosError(error) &&
    "response" in error &&
    error.response &&
    "status" in error.response
  ) {
    if (error.response.status === 400) {
      return false;
    }
    if (error.response.status === 401) {
      return false;
    }
    if (error.response.status === 403) {
      return false;
    }
    if (error.response.status === 404) {
      return false;
    }
    if (error.response.status === 413) {
      return false;
    }
    if (error.response.status === 429) {
      return true;
    }
  }

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
