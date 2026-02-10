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
