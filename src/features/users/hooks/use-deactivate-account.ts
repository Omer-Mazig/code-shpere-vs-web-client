import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth.context";
import { usersApi } from "../users.api";

export function useDeactivateAccount() {
  const { logout } = useAuth();

  return useMutation({
    mutationKey: ["users", "deactivate"],
    mutationFn: () => usersApi.deactivate(),
    onSuccess: () => logout(),
  });
}
