import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../auth.context";
import { authApi } from "../auth.api";
import type { ChangePasswordDto } from "../types";

export function useChangePassword() {
  const { applySession } = useAuth();

  return useMutation({
    mutationKey: ["auth", "changePassword"],
    mutationFn: (dto: ChangePasswordDto) => authApi.changePassword(dto),
    onSuccess: applySession,
  });
}
