import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../comments.api";
import type { Comment, CreateCommentDto } from "../types";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import type { PaginatedResponse } from "@/lib/types";

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
        queryClient.setQueryData(threadOptions.queryKey, (old) => {
          if (!old || old.pages.length === 0) return old;

          const [firstPage, ...restPages] = old.pages;
          if (!Array.isArray(firstPage.items)) return old;

          const updatedFirstPage: PaginatedResponse<Comment> = {
            ...firstPage,
            items: [data, ...firstPage.items],
            meta: {
              ...firstPage.meta,
              total:
                typeof firstPage.meta.total === "number"
                  ? firstPage.meta.total + 1
                  : firstPage.meta.total,
            },
          };

          return {
            ...old,
            pages: [updatedFirstPage, ...restPages],
          };
        });
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
