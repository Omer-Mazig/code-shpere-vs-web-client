import { useMutation, useQueryClient } from "@tanstack/react-query";
import { interactionsApi } from "../interactions.api";
import { postsQueryOptionsFactory } from "@/features/posts/posts-query-options-factory";
import { articlesQueryOptionsFactory } from "@/features/articles/articles-query-options-factory";
import { toast } from "sonner";
import { commentsQueryOptionsFactory } from "@/features/comments/comments-query-options-factory";
import { updateLikeInData } from "../like-cache";
import { getApiError } from "@/lib/errors";
import type { LikeTargetType } from "../types";

export function useToggleLike(
  targetId: string,
  targetType: LikeTargetType,
) {
  const queryClient = useQueryClient();

  const rootQueryKey =
    targetType === "POST"
      ? postsQueryOptionsFactory.all().queryKey
      : targetType === "ARTICLE"
        ? articlesQueryOptionsFactory.all().queryKey
        : commentsQueryOptionsFactory.all().queryKey;

  const mutation = useMutation({
    mutationFn: ({ action }: { action: "like" | "unlike" }) => {
      if (action === "like") {
        return interactionsApi.like(targetId, targetType);
      }
      return interactionsApi.unlike(targetId, targetType);
    },
    onMutate: async ({ action }) => {
      await queryClient.cancelQueries({ queryKey: rootQueryKey });

      const isLiking = action === "like";
      const delta = isLiking ? 1 : -1;

      // Snapshot all cached queries under the root key
      const previousQueries = queryClient.getQueriesData({
        queryKey: rootQueryKey,
      });

      // Optimistically update every cached query that contains this item
      for (const [key] of previousQueries) {
        queryClient.setQueryData(key, (old: unknown) =>
          updateLikeInData(old, targetId, isLiking, delta),
        );
      }

      return { previousQueries };
    },
    onError: (error, variables, context) => {
      const errorCode = getApiError(error).errorCode;
      if (errorCode === "ALREADY_LIKED" || errorCode === "NOT_LIKED") {
        return;
      }

      // Roll back all caches
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }

      toast.error(
        `Failed to ${variables.action} this ${targetType.toLowerCase()}`,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: rootQueryKey });
    },
  });

  const toggle = (isCurrentlyLiked: boolean) => {
    mutation.mutate({ action: isCurrentlyLiked ? "unlike" : "like" });
  };

  return { toggle, isPending: mutation.isPending };
}
