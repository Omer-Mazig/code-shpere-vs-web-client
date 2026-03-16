import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../notifications.api";
import { notificationsQueryOptionsFactory } from "../notifications-query-options-factory";
import { markAllNotificationsReadInCache } from "../notifications-cache";

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const unreadCountQueryKey = notificationsQueryOptionsFactory.unreadCount().queryKey;

  return useMutation({
    mutationKey: ["notifications", "mark-all-read"],
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: unreadCountQueryKey });
      const previousCount = queryClient.getQueryData<{ count: number }>(
        unreadCountQueryKey,
      );

      markAllNotificationsReadInCache(queryClient);
      queryClient.setQueryData(unreadCountQueryKey, { count: 0 });

      return { previousCount };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCount) {
        queryClient.setQueryData(unreadCountQueryKey, context.previousCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryOptionsFactory.lists().queryKey,
      });
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey });
    },
  });
};
