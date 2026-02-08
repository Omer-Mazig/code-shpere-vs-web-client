import { queryOptions } from "@tanstack/react-query";
import { usersApi } from "./users.api";

export const usersQueryOptionsFactory = {
  // ["users"]
  all: () => queryOptions({ queryKey: ["users"] }),

  // ["users", "profile"]
  allProfiles: () =>
    queryOptions({
      queryKey: [...usersQueryOptionsFactory.all().queryKey, "profile"],
    }),

  // ["users", "profile", userId]
  profile: (userId: string) =>
    queryOptions({
      queryKey: [...usersQueryOptionsFactory.allProfiles().queryKey, userId],
      queryFn: () => usersApi.getProfile(userId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  // ["users", "followers", userId]
  followers: (userId: string) =>
    queryOptions({
      queryKey: [
        ...usersQueryOptionsFactory.all().queryKey,
        "followers",
        userId,
      ],
      queryFn: () => usersApi.getFollowers(userId),
      staleTime: 1000 * 60 * 5,
    }),

  // ["users", "following", userId]
  following: (userId: string) =>
    queryOptions({
      queryKey: [
        ...usersQueryOptionsFactory.all().queryKey,
        "following",
        userId,
      ],
      queryFn: () => usersApi.getFollowing(userId),
      staleTime: 1000 * 60 * 5,
    }),
};
