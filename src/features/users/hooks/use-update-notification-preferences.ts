import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiError } from "@/lib/errors";
import { usersApi } from "../users.api";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
} from "../types";

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const queryKey =
    usersQueryOptionsFactory.notificationPreferences().queryKey;

  return useMutation({
    mutationKey: ["users", "updateNotificationPreferences"],
    mutationFn: (dto: UpdateNotificationPreferencesDto) =>
      usersApi.updateNotificationPreferences(dto),
    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<NotificationPreferences>(queryKey);

      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(queryKey, {
          ...previous,
          ...dto,
        });
      }

      return { previous };
    },
    onError: (error, _dto, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(
        getApiError(error).message ?? "Could not update notifications.",
      );
    },
    onSuccess: (prefs) => {
      queryClient.setQueryData(queryKey, prefs);
    },
  });
}
