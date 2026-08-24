import { infiniteQueryOptions, queryOptions } from "@/lib/query-options";
import { notificationsApi } from "./notifications.api";
import type { NotificationTargetType } from "./types";

const DEFAULT_NOTIFICATIONS_PAGE_SIZE = 20;

export type NotificationsListFilters = {
  targetType?: NotificationTargetType;
  isRead?: boolean;
};

export const notificationsQueryOptionsFactory = {
  all: () => queryOptions({ queryKey: ["notifications"] }),

  lists: () =>
    infiniteQueryOptions({
      queryKey: [...notificationsQueryOptionsFactory.all().queryKey, "list"],
      queryFn: ({ pageParam }) =>
        notificationsApi.getNotifications(
          Number(pageParam),
          DEFAULT_NOTIFICATIONS_PAGE_SIZE,
        ),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
      staleTime: 1000 * 30,
    }),

  list: (
    limit = DEFAULT_NOTIFICATIONS_PAGE_SIZE,
    filters?: NotificationsListFilters,
  ) =>
    infiniteQueryOptions({
      queryKey: [
        ...notificationsQueryOptionsFactory.lists().queryKey,
        limit,
        filters,
      ],
      queryFn: ({ pageParam }) =>
        notificationsApi.getNotifications(Number(pageParam), limit, filters),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
      staleTime: 1000 * 30,
    }),

  unreadCount: () =>
    queryOptions({
      queryKey: [
        ...notificationsQueryOptionsFactory.all().queryKey,
        "unread-count",
      ],
      queryFn: () => notificationsApi.getUnreadCount(),
      staleTime: 1000 * 15,
      // Badge count has no skeleton; padding would make the badge pop in late.
      meta: { minPending: false },
    }),
};

export { DEFAULT_NOTIFICATIONS_PAGE_SIZE };
