import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "../articles.api";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import type { CreateArticleDto } from "../types";

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["articles", "create"],
    mutationFn: (dto: CreateArticleDto) => articlesApi.create(dto),
    onSuccess: (article) => {
      if (!article.isPublished) {
        void queryClient.invalidateQueries({
          queryKey: articlesQueryOptionsFactory.drafts().queryKey,
        });
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: articlesQueryOptionsFactory.lists().queryKey,
      });
    },
  });
}
