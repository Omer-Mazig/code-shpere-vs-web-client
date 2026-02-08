import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "../posts.api";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import { toast } from "sonner";

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["posts", "delete"],
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postsQueryOptionsFactory.all().queryKey,
      });
      toast.success("Post deleted");
    },
  });
}
