import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../users.api";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import { toast } from "sonner";

export function useFollowUser(targetUserId: string) {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationKey: ["users", "follow", targetUserId],
    mutationFn: () => usersApi.follow(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersQueryOptionsFactory.profile(targetUserId).queryKey,
      });
      toast.success("Followed!");
    },
  });

  const unfollowMutation = useMutation({
    mutationKey: ["users", "unfollow", targetUserId],
    mutationFn: () => usersApi.unfollow(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersQueryOptionsFactory.profile(targetUserId).queryKey,
      });
      toast.success("Unfollowed");
    },
  });

  return { followMutation, unfollowMutation };
}
