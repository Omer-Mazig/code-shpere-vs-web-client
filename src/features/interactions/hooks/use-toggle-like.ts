import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { interactionsApi } from "../interactions.api";
import { postsQueryOptionsFactory } from "@/features/posts/posts-query-options-factory";
import { articlesQueryOptionsFactory } from "@/features/articles/articles-query-options-factory";
import { toast } from "sonner";

/**
 * Recursively traverses query cache data structures (single items,
 * paginated responses, infinite query pages) and toggles the like
 * state for the item matching `targetId`.
 */
function updateLikeInData(
  data: unknown,
  targetId: string,
  isLiked: boolean,
  delta: number,
): unknown {
  if (!data || typeof data !== "object") return data;

  const record = data as Record<string, unknown>;

  // Single item (detail query)
  if ("id" in record && record.id === targetId && "likesCount" in record) {
    return {
      ...record,
      isLiked,
      likesCount: Math.max(0, (record.likesCount as number) + delta),
    };
  }

  // Paginated response ({ items: T[], meta: ... })
  if ("items" in record && Array.isArray(record.items)) {
    return {
      ...record,
      items: (record.items as Record<string, unknown>[]).map((item) =>
        item.id === targetId && "likesCount" in item
          ? {
              ...item,
              isLiked,
              likesCount: Math.max(0, (item.likesCount as number) + delta),
            }
          : item,
      ),
    };
  }

  // Infinite query data ({ pages: [...], pageParams: [...] })
  if ("pages" in record && Array.isArray(record.pages)) {
    return {
      ...record,
      pages: (record.pages as unknown[]).map((page) =>
        updateLikeInData(page, targetId, isLiked, delta),
      ),
    };
  }

  return data;
}

export function useToggleLike(
  targetId: string,
  targetType: "POST" | "ARTICLE",
) {
  const queryClient = useQueryClient();

  const rootQueryKey =
    targetType === "POST"
      ? postsQueryOptionsFactory.all().queryKey
      : articlesQueryOptionsFactory.all().queryKey;

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
      // 409 = already liked / 400 = not liked — desired state matches, skip rollback
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 409 || status === 400) return;
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
