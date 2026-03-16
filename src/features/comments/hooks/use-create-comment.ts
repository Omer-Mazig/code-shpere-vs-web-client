import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../comments.api";
import type { Comment, CreateCommentDto } from "../types";
import { toast } from "sonner";
import { postsQueryOptionsFactory } from "@/features/posts/posts-query-options-factory";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import type { PaginatedResponse } from "@/lib/types";
import React from "react";

export function useCreateComment() {
  const queryClient = useQueryClient();
  const [lastCreatedCommentId, setLastCreatedCommentId] = React.useState<
    string | null
  >(null);

  const mutation = useMutation({
    mutationKey: ["comments", "create"],
    mutationFn: (dto: CreateCommentDto) => commentsApi.addComment(dto),
    onSuccess: (data, variables) => {
      // Top-level comments: update the thread cache in-place
      if (!variables.parentId) {
        const threadOptions = commentsQueryOptionsFactory.thread(
          variables.targetId,
          variables.targetType as "POST" | "ARTICLE",
        );

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

        setLastCreatedCommentId(data.id);
      } else {
        // For replies, keep the existing behavior and let queries refetch
        queryClient.invalidateQueries({
          queryKey: commentsQueryOptionsFactory.all().queryKey,
        });
      }

      if (variables.targetType === "POST") {
        queryClient.invalidateQueries({
          queryKey: postsQueryOptionsFactory.all().queryKey,
        });
      }

      toast.success("Comment added!");
    },
  });

  return {
    ...mutation,
    lastCreatedCommentId,
    resetLastCreatedCommentId: () => setLastCreatedCommentId(null),
  };
}
