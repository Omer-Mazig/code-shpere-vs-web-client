import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "../articles.api";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import type { UpdateArticleDto } from "../types";
import { toast } from "sonner";
import { getApiError } from "@/lib/errors";

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
      toast.success("Article updated!");
    },
    onError: (error) => {
      toast.error(getApiError(error).message ?? "Could not update article");
    },
  });
}
