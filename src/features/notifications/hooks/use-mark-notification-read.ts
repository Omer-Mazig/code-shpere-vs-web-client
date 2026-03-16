import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../notifications.api";
import { notificationsQueryOptionsFactory } from "../notifications-query-options-factory";
import { markNotificationReadInCache } from "../notifications-cache";

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const unreadCountQueryKey = notificationsQueryOptionsFactory.unreadCount().queryKey;

  return useMutation({
    mutationKey: ["notifications", "mark-read"],
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: unreadCountQueryKey });

      const previousCount = queryClient.getQueryData<{ count: number }>(
        unreadCountQueryKey,
      );

      markNotificationReadInCache(queryClient, notificationId);

      if (previousCount) {
        queryClient.setQueryData(unreadCountQueryKey, {
          count: Math.max(0, previousCount.count - 1),
        });
      }

      return { previousCount };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCount) {
        queryClient.setQueryData(unreadCountQueryKey, context.previousCount);
      }
    },
    onSuccess: (notification) => {
      markNotificationReadInCache(queryClient, notification.id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
      queryClient.invalidateQueries({
        queryKey: notificationsQueryOptionsFactory.lists().queryKey,
      });
    },
  });
};
