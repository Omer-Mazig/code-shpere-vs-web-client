import type { InfiniteData } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/lib/types";

export function prependToInfiniteList<T>(
  old: InfiniteData<PaginatedResponse<T>> | undefined,
  item: T,
): InfiniteData<PaginatedResponse<T>> | undefined {
  if (!old || old.pages.length === 0) return old;

  const [firstPage, ...restPages] = old.pages;
  if (!Array.isArray(firstPage.items)) return old;

  const updatedFirstPage: PaginatedResponse<T> = {
    ...firstPage,
    items: [item, ...firstPage.items],
    meta: {
      ...firstPage.meta,
      total:
        typeof firstPage.meta.total === "number"
          ? firstPage.meta.total + 1
          : firstPage.meta.total,
    },
  };

  return {
    ...old,
    pages: [updatedFirstPage, ...restPages],
  };
}
