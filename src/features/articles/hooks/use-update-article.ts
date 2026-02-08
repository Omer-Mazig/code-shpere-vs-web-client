import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "../articles.api";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import type { UpdateArticleDto } from "../types";
import { toast } from "sonner";

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["articles", "update"],
    mutationFn: ({ id, dto }: { id: string; dto: UpdateArticleDto }) =>
      articlesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: articlesQueryOptionsFactory.all().queryKey,
      });
      toast.success("Article updated!");
    },
  });
}
