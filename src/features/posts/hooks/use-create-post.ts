import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "../posts.api";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import type { CreatePostDto, Post } from "../types";
import { prependToInfiniteList } from "@/lib/infinite-query-cache";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["posts", "create"],
    mutationFn: (dto: CreatePostDto) => postsApi.create(dto),
    onSuccess: (data: Post) => {
      if (!data.isPublished) {
        void queryClient.invalidateQueries({
          queryKey: postsQueryOptionsFactory.drafts().queryKey,
        });
        return;
      }

      const feedOptions = postsQueryOptionsFactory.feedList();
      queryClient.setQueryData(feedOptions.queryKey, (old) =>
        prependToInfiniteList(old, data),
      );
    },
  });
}
