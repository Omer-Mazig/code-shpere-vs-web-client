import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { notificationsApi } from "./notifications.api";

const DEFAULT_NOTIFICATIONS_PAGE_SIZE = 20;

export const notificationsQueryOptionsFactory = {
  all: () => queryOptions({ queryKey: ["notifications"] }),

  lists: () =>
    infiniteQueryOptions({
      queryKey: [...notificationsQueryOptionsFactory.all().queryKey, "list"],
      queryFn: ({ pageParam }) =>
        notificationsApi.getNotifications(Number(pageParam), DEFAULT_NOTIFICATIONS_PAGE_SIZE),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
      staleTime: 1000 * 30,
    }),

  list: (limit = DEFAULT_NOTIFICATIONS_PAGE_SIZE) =>
    infiniteQueryOptions({
      queryKey: [...notificationsQueryOptionsFactory.lists().queryKey, limit],
      queryFn: ({ pageParam }) =>
        notificationsApi.getNotifications(Number(pageParam), limit),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
      staleTime: 1000 * 30,
    }),

  unreadCount: () =>
    queryOptions({
      queryKey: [...notificationsQueryOptionsFactory.all().queryKey, "unread-count"],
      queryFn: () => notificationsApi.getUnreadCount(),
      staleTime: 1000 * 15,
    }),
};

export { DEFAULT_NOTIFICATIONS_PAGE_SIZE };
