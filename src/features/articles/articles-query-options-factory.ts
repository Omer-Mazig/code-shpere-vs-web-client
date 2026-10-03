import { keepPreviousData } from "@tanstack/react-query";
import { queryOptions } from "@/lib/query-options";
import { articlesApi } from "./articles.api";
import type { ArticleQueryDto } from "./types";

export const articlesQueryOptionsFactory = {
  // ["articles"]
  all: () => queryOptions({ queryKey: ["articles"] }),

  // ["articles", "list"]
  lists: () =>
    queryOptions({
      queryKey: [...articlesQueryOptionsFactory.all().queryKey, "list"],
    }),

  // ["articles", "list", articleQueryDto]
  list: (articleQueryDto?: Partial<ArticleQueryDto>) =>
    queryOptions({
      queryKey: [
        ...articlesQueryOptionsFactory.lists().queryKey,
        articleQueryDto,
      ],
      queryFn: () => articlesApi.list(articleQueryDto),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  drafts: () =>
    queryOptions({
      queryKey: [...articlesQueryOptionsFactory.all().queryKey, "drafts"],
      queryFn: () => articlesApi.listDrafts({ page: 1, limit: 50 }),
    }),

  // ["articles", "authors"]
  publishedAuthors: () =>
    queryOptions({
      queryKey: [...articlesQueryOptionsFactory.all().queryKey, "authors"],
      queryFn: () => articlesApi.listPublishedAuthors(),
      staleTime: 1000 * 60 * 5,
      meta: { minPending: false },
    }),

  // ["articles", "suggestions", viewerId, limit] — viewerId keeps results fresh across sign-in/out
  suggestions: (limit = 4, viewerId?: string) =>
    queryOptions({
      queryKey: [
        ...articlesQueryOptionsFactory.all().queryKey,
        "suggestions",
        viewerId ?? "guest",
        limit,
      ],
      queryFn: () => articlesApi.getSuggestions(limit),
      staleTime: 1000 * 60 * 5,
    }),

  // ["articles", "details"]
  allDetails: () =>
    queryOptions({
      queryKey: [...articlesQueryOptionsFactory.all().queryKey, "details"],
    }),

  // ["articles", "details", slug]
  details: (slug: string) =>
    queryOptions({
      queryKey: [...articlesQueryOptionsFactory.allDetails().queryKey, slug],
      queryFn: () => articlesApi.getBySlug(slug),
      staleTime: 1000 * 60 * 10, // 10 minutes
    }),
};
