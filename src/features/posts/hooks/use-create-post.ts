import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "../posts.api";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import type { CreatePostDto } from "../types";
import { toast } from "sonner";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["posts", "create"],
    mutationFn: (dto: CreatePostDto) => postsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postsQueryOptionsFactory.feedLists().queryKey,
      });
      toast.success("Post created!");
    },
  });
}
