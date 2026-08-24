import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../comments.api";
import type { UpdateCommentDto } from "../types";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["comments", "update"],
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCommentDto }) =>
      commentsApi.updateComment(id, dto),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: commentsQueryOptionsFactory.all().queryKey,
      });
    },
  });
}
