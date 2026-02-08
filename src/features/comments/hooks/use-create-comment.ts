import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../comments.api";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import type { CreateCommentDto } from "../types";
import { toast } from "sonner";

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["comments", "create"],
    mutationFn: (dto: CreateCommentDto) => commentsApi.addComment(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentsQueryOptionsFactory.forTarget(
          variables.targetId,
          variables.targetType,
        ).queryKey,
      });
      toast.success("Comment added!");
    },
  });
}
