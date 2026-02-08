import { queryOptions } from "@tanstack/react-query";
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
      staleTime: 1000 * 60 * 5, // 5 minutes
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
