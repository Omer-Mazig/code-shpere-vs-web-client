import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "../articles.api";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import type { UpdateArticleDto } from "../types";

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["articles", "update"],
    mutationFn: ({ id, dto }: { id: string; dto: UpdateArticleDto }) =>
      articlesApi.update(id, dto),
    onSuccess: (article) => {
      queryClient.invalidateQueries({
        queryKey: articlesQueryOptionsFactory.all().queryKey,
      });
      queryClient.setQueryData(
        articlesQueryOptionsFactory.details(article.slug).queryKey,
        article,
      );
    },
  });
}
