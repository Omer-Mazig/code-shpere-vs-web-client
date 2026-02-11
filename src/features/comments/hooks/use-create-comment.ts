import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../comments.api";
import type { CreateCommentDto } from "../types";
import { toast } from "sonner";
import { postsQueryOptionsFactory } from "@/features/posts/posts-query-options-factory";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["comments", "create"],
    mutationFn: (dto: CreateCommentDto) => commentsApi.addComment(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentsQueryOptionsFactory.all().queryKey,
      });
      if (variables.targetType === "POST") {
        queryClient.invalidateQueries({
          queryKey: postsQueryOptionsFactory.all().queryKey,
        });
      }
      toast.success("Comment added!");
    },
  });
}
