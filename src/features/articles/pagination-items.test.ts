import { describe, expect, it } from "vitest";
import { paginationItems } from "./pagination-items";

describe("paginationItems", () => {
  it("returns an empty list for a single page", () => {
    expect(paginationItems(1, 1)).toEqual([]);
  });

  it("lists every page when there are few of them", () => {
    expect(paginationItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("ellipsizes a long range around the current page", () => {
    expect(paginationItems(1, 12)).toEqual([1, 2, "ellipsis", 12]);
    expect(paginationItems(6, 12)).toEqual([1, "ellipsis", 5, 6, 7, "ellipsis", 12]);
    expect(paginationItems(12, 12)).toEqual([1, "ellipsis", 11, 12]);
  });
});
