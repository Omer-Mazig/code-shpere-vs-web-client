import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../users.api";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import type { UpdateNotificationPreferencesDto } from "../types";

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const queryKey =
    usersQueryOptionsFactory.notificationPreferences().queryKey;

  return useMutation({
    mutationKey: ["users", "updateNotificationPreferences"],
    mutationFn: (dto: UpdateNotificationPreferencesDto) =>
      usersApi.updateNotificationPreferences(dto),
    onSuccess: (prefs) => {
      queryClient.setQueryData(queryKey, prefs);
    },
  });
}
