import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../users.api";
import { usersQueryOptionsFactory } from "../users-query-options-factory";

export function useBlockUser(targetUserId: string) {
  const queryClient = useQueryClient();

  const invalidateProfile = () => {
    queryClient.invalidateQueries({
      queryKey: usersQueryOptionsFactory.profile(targetUserId).queryKey,
    });
  };

  const blockMutation = useMutation({
    mutationKey: ["users", "block", targetUserId],
    mutationFn: () => usersApi.block(targetUserId),
    onSuccess: invalidateProfile,
  });

  const unblockMutation = useMutation({
    mutationKey: ["users", "unblock", targetUserId],
    mutationFn: () => usersApi.unblock(targetUserId),
    onSuccess: invalidateProfile,
  });

  return { blockMutation, unblockMutation };
}
