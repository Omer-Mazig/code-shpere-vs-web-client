import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../comments.api";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["comments", "delete"],
    mutationFn: (id: string) => commentsApi.deleteComment(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: commentsQueryOptionsFactory.all().queryKey,
      }),
  });
}
