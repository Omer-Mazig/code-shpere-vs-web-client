import { describe, expect, it } from "vitest";
import type { InfiniteData } from "@tanstack/react-query";
import type { PaginatedResponse } from "./types";
import { prependToInfiniteList } from "./infinite-query-cache";

function page<T>(
  items: T[],
  total = items.length,
): PaginatedResponse<T> {
  return {
    items,
    meta: {
      total,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

function infinite<T>(
  ...pages: PaginatedResponse<T>[]
): InfiniteData<PaginatedResponse<T>> {
  return {
    pages,
    pageParams: pages.map((_, index) => index + 1),
  };
}

describe("prependToInfiniteList", () => {
  it("returns the original value when there is no cache", () => {
    expect(prependToInfiniteList(undefined, { id: "1" })).toBeUndefined();
    expect(prependToInfiniteList(infinite(), { id: "1" })).toEqual(infinite());
  });

  it("prepends the item to the first page and increments total", () => {
    const old = infinite(
      page([{ id: "existing" }], 1),
      page([{ id: "older" }], 1),
    );

    const next = prependToInfiniteList(old, { id: "new" });

    expect(next?.pages[0].items).toEqual([{ id: "new" }, { id: "existing" }]);
    expect(next?.pages[0].meta.total).toBe(2);
    expect(next?.pages[1].items).toEqual([{ id: "older" }]);
    expect(next?.pageParams).toEqual(old.pageParams);
  });

  it("leaves a non-numeric total unchanged", () => {
    const old = infinite(page([{ id: "existing" }], 1));
    old.pages[0].meta.total = "unknown" as unknown as number;

    const next = prependToInfiniteList(old, { id: "new" });

    expect(next?.pages[0].meta.total).toBe("unknown");
    expect(next?.pages[0].items[0]).toEqual({ id: "new" });
  });
});
