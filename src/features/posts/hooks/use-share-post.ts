import { useMutation, useQueryClient } from "@tanstack/react-query";
import { interactionsApi } from "@/features/interactions/interactions.api";
import { postsApi } from "../posts.api";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import { updateShareInData } from "@/features/interactions/share-cache";
import { prependToInfiniteList } from "@/lib/infinite-query-cache";
import type { CreatePostDto, Post } from "../types";

const markPostShared = (queryClient: ReturnType<typeof useQueryClient>, postId: string) => {
  const previousQueries = queryClient.getQueriesData({
    queryKey: postsQueryOptionsFactory.all().queryKey,
  });

  for (const [key] of previousQueries) {
    queryClient.setQueryData(key, (old: unknown) =>
      updateShareInData(old, postId),
    );
  }

  return previousQueries;
};

export function useCopyPostLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const url = `${window.location.origin}/feed/${postId}`;
      await navigator.clipboard.writeText(url);
      try {
        await interactionsApi.share(postId, "POST");
      } catch {
        // Link is already on the clipboard; share count may refresh on settle.
      }
      return postId;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({
        queryKey: postsQueryOptionsFactory.all().queryKey,
      });
      const previousQueries = markPostShared(queryClient, postId);
      return { previousQueries };
    },
    onError: (_error, _postId, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: postsQueryOptionsFactory.all().queryKey,
      });
    },
  });
}

export function useResharePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePostDto) => postsApi.create(dto),
    onSuccess: (data: Post, dto) => {
      const feedOptions = postsQueryOptionsFactory.feedList();
      queryClient.setQueryData(feedOptions.queryKey, (old) =>
        prependToInfiniteList(old, data),
      );

      if (dto.sharedPostId) {
        markPostShared(queryClient, dto.sharedPostId);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: postsQueryOptionsFactory.all().queryKey,
      });
    },
  });
}
