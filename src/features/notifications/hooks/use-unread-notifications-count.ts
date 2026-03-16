import { useQuery } from "@tanstack/react-query";
import { notificationsQueryOptionsFactory } from "../notifications-query-options-factory";

export const useUnreadNotificationsCount = (enabled = true) => {
  return useQuery({
    ...notificationsQueryOptionsFactory.unreadCount(),
    enabled,
  });
};
