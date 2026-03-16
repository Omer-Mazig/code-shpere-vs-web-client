import { useInfiniteQuery } from "@tanstack/react-query";
import {
  DEFAULT_NOTIFICATIONS_PAGE_SIZE,
  type NotificationsListFilters,
  notificationsQueryOptionsFactory,
} from "../notifications-query-options-factory";

export const useNotificationsList = (
  limit = DEFAULT_NOTIFICATIONS_PAGE_SIZE,
  enabled = true,
  filters?: NotificationsListFilters,
) => {
  return useInfiniteQuery({
    ...notificationsQueryOptionsFactory.list(limit, filters),
    enabled,
  });
};
