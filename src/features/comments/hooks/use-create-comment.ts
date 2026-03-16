import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../comments.api";
import type { Comment, CreateCommentDto } from "../types";
import { toast } from "sonner";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import type { PaginatedResponse } from "@/lib/types";
import React from "react";

export function useCreateComment() {
  const queryClient = useQueryClient();
  const [lastCreatedCommentId, setLastCreatedCommentId] = React.useState<
    string | null
  >(null);
  const [pendingParentId, setPendingParentId] = React.useState<
    string | null | undefined
  >(undefined);

  const mutation = useMutation({
    mutationKey: ["comments", "create"],
    mutationFn: (dto: CreateCommentDto) => commentsApi.addComment(dto),
    onMutate: (variables) => {
      setPendingParentId(variables.parentId ?? null);
    },
    onSuccess: async (data, variables) => {
      // Thread cache (top-level comments list) – always keep counts in sync
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
        await queryClient.invalidateQueries({
          queryKey: commentsQueryOptionsFactory.all().queryKey,
        });
      }

      setLastCreatedCommentId(data.id);

      toast.success("Comment added!");
    },
    onSettled: () => {
      setPendingParentId(undefined);
    },
  });

  return {
    ...mutation,
    lastCreatedCommentId,
    pendingParentId,
    resetLastCreatedCommentId: () => setLastCreatedCommentId(null),
  };
}
