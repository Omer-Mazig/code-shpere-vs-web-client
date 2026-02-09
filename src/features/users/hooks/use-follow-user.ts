import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usersApi } from "../users.api";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import { toast } from "sonner";

export function useFollowUser(targetUserId: string) {
  const queryClient = useQueryClient();
  const profileQueryKey =
    usersQueryOptionsFactory.profile(targetUserId).queryKey;

  const followMutation = useMutation({
    mutationKey: ["users", "follow", targetUserId],
    mutationFn: () => usersApi.follow(targetUserId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: profileQueryKey });
      const previous = queryClient.getQueryData(profileQueryKey);

      if (previous) {
        queryClient.setQueryData(profileQueryKey, {
          ...previous,
          isFollowing: true,
          followersCount: previous.followersCount + 1,
        });
      }

      return { previous };
    },
    onError: (error, _variables, context) => {
      // 409 = already following — optimistic state is correct, just let onSettled refetch
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return;
      }

      if (context?.previous) {
        queryClient.setQueryData(profileQueryKey, context.previous);
      }
      toast.error("Failed to follow user");
    },
    onSettled: () => {
      if (
        queryClient.isMutating({
          mutationKey: ["users", "follow", targetUserId],
        }) === 1
      ) {
        queryClient.invalidateQueries({ queryKey: profileQueryKey });
      }
    },
  });

  const unfollowMutation = useMutation({
    mutationKey: ["users", "unfollow", targetUserId],
    mutationFn: () => usersApi.unfollow(targetUserId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: profileQueryKey });
      const previous = queryClient.getQueryData(profileQueryKey);

      if (previous) {
        queryClient.setQueryData(profileQueryKey, {
          ...previous,
          isFollowing: false,
          followersCount: Math.max(0, previous.followersCount - 1),
        });
      }

      return { previous };
    },
    onError: (error, _variables, context) => {
      // 400 USER_NOT_FOLLOWED — optimistic state is correct, just let onSettled refetch
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        return;
      }

      if (context?.previous) {
        queryClient.setQueryData(profileQueryKey, context.previous);
      }
      toast.error("Failed to unfollow user");
    },
    onSettled: () => {
      if (
        queryClient.isMutating({
          mutationKey: ["users", "unfollow", targetUserId],
        }) === 1
      ) {
        queryClient.invalidateQueries({ queryKey: profileQueryKey });
      }
    },
  });

  return { followMutation, unfollowMutation };
}
