import {
  infiniteQueryOptions as createInfiniteQueryOptions,
  queryOptions as createQueryOptions,
} from "@tanstack/react-query";
import { applyMinPending } from "./min-pending";

/**
 * Drop-in replacements for TanStack `queryOptions` / `infiniteQueryOptions`.
 * First-load queryFns stay pending for at least 300ms so skeletons don't flash.
 *
 * Opt out with `meta: { minPending: false }` (auth session, typeahead, badges).
 */
export const queryOptions = ((options: Parameters<typeof createQueryOptions>[0]) =>
  createQueryOptions(
    applyMinPending(options),
  )) as typeof createQueryOptions;

export const infiniteQueryOptions = ((
  options: Parameters<typeof createInfiniteQueryOptions>[0],
) =>
  createInfiniteQueryOptions(
    applyMinPending(options),
  )) as typeof createInfiniteQueryOptions;
