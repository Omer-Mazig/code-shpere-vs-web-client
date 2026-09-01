import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiError } from "@/lib/errors";
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
      toast.success("Article deleted");
    },
    onError: (error) => {
      toast.error(getApiError(error).message ?? "Could not delete article");
    },
  });
}
