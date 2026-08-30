import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../users.api";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import type { UpdateProfileDto } from "../types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["users", "updateMyProfile"],
    mutationFn: (dto: UpdateProfileDto) => usersApi.updateMyProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersQueryOptionsFactory.allProfiles().queryKey,
      });
    },
  });
}
