import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../comments.api";
import type { CreateCommentDto } from "../types";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import { prependToInfiniteList } from "@/lib/infinite-query-cache";

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["comments", "create"],
    mutationFn: (dto: CreateCommentDto) => commentsApi.addComment(dto),
    onSuccess: async (data, variables) => {
      // Only handle cache-level updates here.
      const threadOptions = commentsQueryOptionsFactory.thread(
        variables.targetId,
        variables.targetType as "POST" | "ARTICLE",
      );

      if (!variables.parentId) {
        // Top-level comments: insert into thread's first page
        queryClient.setQueryData(threadOptions.queryKey, (old) =>
          prependToInfiniteList(old, data),
        );
      } else if (variables.parentId) {
        // Replies: let existing queries refetch and handle display
        // ✅ keep mutation pending until invalidation finishes
        return queryClient.invalidateQueries({
          queryKey: commentsQueryOptionsFactory.all().queryKey,
        });
      }
    },
  });
}
