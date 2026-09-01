import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../users.api";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import { postsQueryOptionsFactory } from "@/features/posts/posts-query-options-factory";
import { articlesQueryOptionsFactory } from "@/features/articles/articles-query-options-factory";
import { updateFollowInData } from "../follow-cache";
import { getApiError } from "@/lib/errors";

const followCacheQueryKeys = [
  postsQueryOptionsFactory.all().queryKey,
  articlesQueryOptionsFactory.all().queryKey,
  usersQueryOptionsFactory.all().queryKey,
];

export function useFollowUser(targetUserId: string) {
  const queryClient = useQueryClient();

  const applyOptimisticFollow = async (isFollowing: boolean) => {
    await Promise.all(
      followCacheQueryKeys.map((queryKey) =>
        queryClient.cancelQueries({ queryKey }),
      ),
    );

    const previousQueries = followCacheQueryKeys.flatMap((queryKey) =>
      queryClient.getQueriesData({ queryKey }),
    );

    for (const [key] of previousQueries) {
      queryClient.setQueryData(key, (old: unknown) =>
        updateFollowInData(old, targetUserId, isFollowing),
      );
    }

    return { previousQueries };
  };

  const rollbackFollow = (
    previousQueries: ReturnType<typeof queryClient.getQueriesData>,
  ) => {
    for (const [key, data] of previousQueries) {
      queryClient.setQueryData(key, data);
    }
  };

  const invalidateFollowCaches = (mutationKey: string[]) => {
    if (queryClient.isMutating({ mutationKey }) !== 1) {
      return;
    }

    for (const queryKey of followCacheQueryKeys) {
      queryClient.invalidateQueries({ queryKey });
    }
  };

  const followMutation = useMutation({
    mutationKey: ["users", "follow", targetUserId],
    mutationFn: () => usersApi.follow(targetUserId),
    onMutate: () => applyOptimisticFollow(true),
    onError: (error, _variables, context) => {
      if (getApiError(error).errorCode === "USER_ALREADY_FOLLOWED") {
        return;
      }

      if (context?.previousQueries) {
        rollbackFollow(context.previousQueries);
      }
    },
    onSettled: () => {
      invalidateFollowCaches(["users", "follow", targetUserId]);
    },
  });

  const unfollowMutation = useMutation({
    mutationKey: ["users", "unfollow", targetUserId],
    mutationFn: () => usersApi.unfollow(targetUserId),
    onMutate: () => applyOptimisticFollow(false),
    onError: (error, _variables, context) => {
      if (getApiError(error).errorCode === "USER_NOT_FOLLOWED") {
        return;
      }

      if (context?.previousQueries) {
        rollbackFollow(context.previousQueries);
      }
    },
    onSettled: () => {
      invalidateFollowCaches(["users", "unfollow", targetUserId]);
    },
  });

  return { followMutation, unfollowMutation };
}
