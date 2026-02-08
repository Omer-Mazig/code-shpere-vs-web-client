import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../users.api";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import type { UpdateProfileDto } from "../types";
import { toast } from "sonner";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["users", "updateProfile"],
    mutationFn: (dto: UpdateProfileDto) => usersApi.updateProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersQueryOptionsFactory.allProfiles().queryKey,
      });
      toast.success("Profile updated!");
    },
  });
}
