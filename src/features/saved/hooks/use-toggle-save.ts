import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesQueryOptionsFactory } from "@/features/articles/articles-query-options-factory";
import { postsQueryOptionsFactory } from "@/features/posts/posts-query-options-factory";
import { getApiError } from "@/lib/errors";
import { savedApi } from "../saved.api";
import { updateSavedInData } from "../saved-cache";
import { savedQueryOptionsFactory } from "../saved-query-options-factory";
import type { SavedTargetType } from "../types";

type SaveAction = { action: "save" | "unsave" };

export function useToggleSave(targetId: string, targetType: SavedTargetType) {
  const queryClient = useQueryClient();
  const rootQueryKey =
    targetType === "POST"
      ? postsQueryOptionsFactory.all().queryKey
      : targetType === "ARTICLE"
        ? articlesQueryOptionsFactory.all().queryKey
        : savedQueryOptionsFactory.all().queryKey;

  const mutation = useMutation({
    mutationKey: ["saved", "toggle", targetType, targetId],
    mutationFn: ({ action }: SaveAction) => {
      const dto = { targetId, targetType };
      if (action === "save") return savedApi.save(dto);
      return savedApi.unsave(dto);
    },
    onMutate: async ({ action }) => {
      await queryClient.cancelQueries({ queryKey: rootQueryKey });
      const previousQueries = queryClient.getQueriesData({
        queryKey: rootQueryKey,
      });
      const isSaved = action === "save";
      for (const [key] of previousQueries) {
        queryClient.setQueryData(key, (old: unknown) =>
          updateSavedInData(old, targetId, isSaved),
        );
      }
      return { previousQueries };
    },
    onError: (error, _variables, context) => {
      const errorCode = getApiError(error).errorCode;
      if (errorCode === "ALREADY_SAVED" || errorCode === "NOT_SAVED") {
        return;
      }
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: rootQueryKey });
      void queryClient.invalidateQueries({
        queryKey: savedQueryOptionsFactory.all().queryKey,
      });
    },
  });

  const toggle = (
    isCurrentlySaved: boolean,
    options?: Parameters<typeof mutation.mutate>[1],
  ) => {
    mutation.mutate(
      { action: isCurrentlySaved ? "unsave" : "save" },
      options,
    );
  };

  return { toggle, isPending: mutation.isPending };
}
