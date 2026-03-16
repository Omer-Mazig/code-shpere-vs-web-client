import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "../posts.api";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import type { CreatePostDto } from "../types";
import type { Post } from "../types";
import type { PaginatedResponse } from "@/lib/types";
import React from "react";

export function useCreatePost() {
  const queryClient = useQueryClient();
  const [lastCreatedPostId, setLastCreatedPostId] = React.useState<
    string | null
  >(null);

  const mutation = useMutation({
    mutationKey: ["posts", "create"],
    mutationFn: (dto: CreatePostDto) => postsApi.create(dto),
    onSuccess: (data: Post) => {
      const feedOptions = postsQueryOptionsFactory.feedList();

      queryClient.setQueryData(feedOptions.queryKey, (old) => {
        if (!old || old.pages.length === 0) return old;

        const [firstPage, ...restPages] = old.pages;
        if (!Array.isArray(firstPage.items)) return old;

        const updatedFirstPage: PaginatedResponse<Post> = {
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

      setLastCreatedPostId(data.id);
    },
  });

  return {
    ...mutation,
    lastCreatedPostId,
    resetLastCreatedPostId: () => setLastCreatedPostId(null),
  };
}
