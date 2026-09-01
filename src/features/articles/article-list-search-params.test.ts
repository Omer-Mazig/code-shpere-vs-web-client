import { describe, expect, it } from "vitest";
import {
  articleListHref,
  parseArticleListSearchParams,
  toArticleListSearchParams,
} from "./article-list-search-params";

describe("parseArticleListSearchParams", () => {
  it("reads page, search, topicId, and authorId", () => {
    const topicId = "11111111-1111-4111-8111-111111111111";
    const authorId = "22222222-2222-4222-8222-222222222222";
    const parsed = parseArticleListSearchParams(
      new URLSearchParams({
        page: "2",
        search: " generics ",
        topicId,
        authorId,
      }),
    );

    expect(parsed).toEqual({
      page: 2,
      search: "generics",
      topicId,
      authorId,
    });
  });

  it("drops invalid page and uuid values", () => {
    expect(
      parseArticleListSearchParams(
        new URLSearchParams({
          page: "0",
          topicId: "not-a-uuid",
          authorId: "also-bad",
        }),
      ),
    ).toEqual({ page: 1, search: undefined, topicId: undefined, authorId: undefined });
  });
});

describe("toArticleListSearchParams", () => {
  it("omits page 1 and empty filters so the directory URL stays clean", () => {
    expect(
      toArticleListSearchParams({
        page: 1,
        search: undefined,
        topicId: undefined,
        authorId: undefined,
      }).toString(),
    ).toBe("");
  });

  it("builds a shareable href for page 2", () => {
    expect(articleListHref({ page: 2, search: "hooks" })).toBe(
      "/articles?page=2&search=hooks",
    );
  });
});
