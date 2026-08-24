import { skipToken, type QueryFunctionContext } from "@tanstack/react-query";

/**
 * Minimum time a query stays pending on first load so skeletons
 * don't flash on fast responses. Background refetches and
 * pagination are not padded — they already have cached data.
 *
 * Disabled in tests so the suite stays fast.
 */
export const MIN_QUERY_PENDING_MS = import.meta.env.MODE === "test" ? 0 : 400;

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(abortError());
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function abortError(): DOMException {
  return new DOMException("The operation was aborted.", "AbortError");
}

/**
 * Resolves (or rejects) only after `minMs` has elapsed since `promise`
 * started. Slow work is unchanged; fast work is padded so pending UI
 * can be seen.
 */
export async function withMinDuration<T>(
  promise: Promise<T>,
  minMs: number = MIN_QUERY_PENDING_MS,
  signal?: AbortSignal,
): Promise<T> {
  const startedAt = Date.now();

  const pad = async () => {
    if (signal?.aborted) return;
    const remaining = minMs - (Date.now() - startedAt);
    if (remaining <= 0) return;
    try {
      await sleep(remaining, signal);
    } catch {
      // Aborted during padding — still settle with the fetched result
      // so the query cache stays warm after unmount.
    }
  };

  try {
    const result = await promise;
    await pad();
    return result;
  } catch (error) {
    await pad();
    throw error;
  }
}

type QueryFnLike = (context: QueryFunctionContext) => unknown;

/**
 * Keeps a query pending for at least `minMs` on first fetch only.
 * If the cache already has data (refetch, next page), the original
 * queryFn runs with no extra wait.
 */
export function wrapQueryFn(
  queryFn: QueryFnLike,
  minMs: number = MIN_QUERY_PENDING_MS,
): QueryFnLike {
  if (minMs <= 0) return queryFn;

  return (context) => {
    const result = Promise.resolve(queryFn(context));

    if (context.client.getQueryData(context.queryKey) !== undefined) {
      return result;
    }

    return withMinDuration(result, minMs, context.signal);
  };
}

/**
 * Applies first-load min-pending to a queryOptions / infiniteQueryOptions
 * object. No-ops when there is no queryFn, skipToken, or
 * `meta.minPending === false`.
 */
export function applyMinPending<T extends object>(options: T): T {
  const queryFn = "queryFn" in options ? options.queryFn : undefined;
  const meta =
    "meta" in options
      ? (options.meta as { minPending?: boolean } | undefined)
      : undefined;

  if (meta?.minPending === false) return options;
  if (queryFn == null || queryFn === skipToken) return options;
  if (typeof queryFn !== "function") return options;

  return {
    ...options,
    queryFn: wrapQueryFn(queryFn as QueryFnLike),
  };
}
