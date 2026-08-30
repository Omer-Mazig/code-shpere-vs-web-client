import { infiniteQueryOptions, queryOptions } from "@/lib/query-options";
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

  // ["users", "profile", "preview", targetUserId]
  preview: (targetUserId: string) =>
    queryOptions({
      queryKey: [
        ...usersQueryOptionsFactory.allProfiles().queryKey,
        "preview",
        targetUserId,
      ],
      queryFn: () => usersApi.getProfilePreview(targetUserId),
      staleTime: 1000 * 60 * 5,
    }),

  // ["users", "suggestions", viewerId, limit] — viewerId keeps results fresh across sign-in/out
  suggestions: (limit = 5, viewerId?: string) =>
    queryOptions({
      queryKey: [
        ...usersQueryOptionsFactory.all().queryKey,
        "suggestions",
        viewerId ?? "guest",
        limit,
      ],
      queryFn: () => usersApi.getSuggestions(limit),
      staleTime: 1000 * 60 * 5,
    }),

  // ["users", "notification-preferences"]
  notificationPreferences: () =>
    queryOptions({
      queryKey: [
        ...usersQueryOptionsFactory.all().queryKey,
        "notification-preferences",
      ],
      queryFn: () => usersApi.getNotificationPreferences(),
      staleTime: 1000 * 60 * 5,
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
