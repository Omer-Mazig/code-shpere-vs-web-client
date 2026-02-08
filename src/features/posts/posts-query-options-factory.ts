import { queryOptions } from "@tanstack/react-query";
import { postsApi } from "./posts.api";
import type { PostQueryDto } from "./types";

export const postsQueryOptionsFactory = {
  // ["posts"]
  all: () => queryOptions({ queryKey: ["posts"] }),

  // ["posts", "feed"]
  feedLists: () =>
    queryOptions({
      queryKey: [...postsQueryOptionsFactory.all().queryKey, "feed"],
    }),

  // ["posts", "feed", postQueryDto]
  feedList: (postQueryDto?: Partial<PostQueryDto>) =>
    queryOptions({
      queryKey: [
        ...postsQueryOptionsFactory.feedLists().queryKey,
        postQueryDto,
      ],
      queryFn: () => postsApi.getFeed(postQueryDto),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  // ["posts", "details"]
  allDetails: () =>
    queryOptions({
      queryKey: [...postsQueryOptionsFactory.all().queryKey, "details"],
    }),

  // ["posts", "details", id]
  details: (id: string) =>
    queryOptions({
      queryKey: [...postsQueryOptionsFactory.allDetails().queryKey, id],
      queryFn: () => postsApi.getById(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),
};
