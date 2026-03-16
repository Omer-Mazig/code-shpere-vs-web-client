import { useInfiniteQuery } from "@tanstack/react-query";
import {
  DEFAULT_NOTIFICATIONS_PAGE_SIZE,
  notificationsQueryOptionsFactory,
} from "../notifications-query-options-factory";

export const useNotificationsList = (
  limit = DEFAULT_NOTIFICATIONS_PAGE_SIZE,
  enabled = true,
) => {
  return useInfiniteQuery({
    ...notificationsQueryOptionsFactory.list(limit),
    enabled,
  });
};
