import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "../articles.api";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["articles", "delete"],
    mutationFn: (id: string) => articlesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: articlesQueryOptionsFactory.all().queryKey,
      });
    },
  });
}
