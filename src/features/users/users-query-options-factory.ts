import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { usersApi } from "./users.api";

const FOLLOW_CONNECTIONS_LIMIT = 20;

export const usersQueryOptionsFactory = {
  // ["users"]
  all: () => queryOptions({ queryKey: ["users"] }),

  // ["users", "profile"]
  allProfiles: () =>
    queryOptions({
      queryKey: [...usersQueryOptionsFactory.all().queryKey, "profile"],
    }),

  // ["users", "profile", "me"]
  myProfile: () =>
    queryOptions({
      queryKey: [...usersQueryOptionsFactory.allProfiles().queryKey, "me"],
      queryFn: () => usersApi.getMyProfile(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  // ["users", "profile", targetUserId]
  profile: (targetUserId: string) =>
    queryOptions({
      queryKey: [
        ...usersQueryOptionsFactory.allProfiles().queryKey,
        targetUserId,
      ],
      queryFn: () => usersApi.getProfile(targetUserId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  // ["users", "followers", userId]
  followers: (userId: string) =>
    infiniteQueryOptions({
      queryKey: [
        ...usersQueryOptionsFactory.all().queryKey,
        "followers",
        userId,
      ],
      queryFn: ({ pageParam }) =>
        usersApi.getFollowers(
          userId,
          Number(pageParam),
          FOLLOW_CONNECTIONS_LIMIT,
        ),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
      staleTime: 1000 * 60 * 5,
    }),

  // ["users", "following", userId]
  following: (userId: string) =>
    infiniteQueryOptions({
      queryKey: [
        ...usersQueryOptionsFactory.all().queryKey,
        "following",
        userId,
      ],
      queryFn: ({ pageParam }) =>
        usersApi.getFollowing(
          userId,
          Number(pageParam),
          FOLLOW_CONNECTIONS_LIMIT,
        ),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
      staleTime: 1000 * 60 * 5,
    }),
};
