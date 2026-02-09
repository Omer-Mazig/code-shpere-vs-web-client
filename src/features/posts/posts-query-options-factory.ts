import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
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

  // ["posts", "feed", postQueryDto] — infinite query
  feedList: (postQueryDto?: Partial<Omit<PostQueryDto, "page">>) =>
    infiniteQueryOptions({
      queryKey: [
        ...postsQueryOptionsFactory.feedLists().queryKey,
        postQueryDto,
      ],
      queryFn: ({ pageParam }) =>
        postsApi.getFeed({ ...postQueryDto, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
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
