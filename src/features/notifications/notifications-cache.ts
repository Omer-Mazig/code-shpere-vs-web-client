import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/lib/types";
import { notificationsQueryOptionsFactory } from "./notifications-query-options-factory";
import type { Notification } from "./types";

type NotificationsInfiniteData = InfiniteData<PaginatedResponse<Notification>>;

export function upsertNotificationInList(
  oldData: NotificationsInfiniteData | undefined,
  notification: Notification,
): NotificationsInfiniteData | undefined {
  if (!oldData || oldData.pages.length === 0) {
    return oldData;
  }

  const [firstPage, ...restPages] = oldData.pages;
  const alreadyExists = firstPage.items.some(
    (item) => item.id === notification.id,
  );
  if (alreadyExists) {
    return oldData;
  }

  return {
    ...oldData,
    pages: [
      {
        ...firstPage,
        items: [notification, ...firstPage.items],
        meta: {
          ...firstPage.meta,
          total:
            typeof firstPage.meta.total === "number"
              ? firstPage.meta.total + 1
              : firstPage.meta.total,
        },
      },
      ...restPages,
    ],
  };
}

export function markNotificationReadInList(
  oldData: NotificationsInfiniteData | undefined,
  notificationId: string,
  readAt: string,
): NotificationsInfiniteData | undefined {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.id === notificationId
          ? { ...item, isRead: true, readAt: item.readAt ?? readAt }
          : item,
      ),
    })),
  };
}

export function markAllNotificationsReadInList(
  oldData: NotificationsInfiniteData | undefined,
  readAt: string,
): NotificationsInfiniteData | undefined {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.isRead ? item : { ...item, isRead: true, readAt },
      ),
    })),
  };
}

export const upsertNotificationInCache = (
  queryClient: QueryClient,
  notification: Notification,
) => {
  queryClient.setQueriesData<NotificationsInfiniteData>(
    { queryKey: notificationsQueryOptionsFactory.lists().queryKey },
    (oldData) => upsertNotificationInList(oldData, notification),
  );
};

export const markNotificationReadInCache = (
  queryClient: QueryClient,
  notificationId: string,
) => {
  const readAt = new Date().toISOString();
  queryClient.setQueriesData<NotificationsInfiniteData>(
    { queryKey: notificationsQueryOptionsFactory.lists().queryKey },
    (oldData) => markNotificationReadInList(oldData, notificationId, readAt),
  );
};

export const markAllNotificationsReadInCache = (queryClient: QueryClient) => {
  const readAt = new Date().toISOString();
  queryClient.setQueriesData<NotificationsInfiniteData>(
    { queryKey: notificationsQueryOptionsFactory.lists().queryKey },
    (oldData) => markAllNotificationsReadInList(oldData, readAt),
  );
};
