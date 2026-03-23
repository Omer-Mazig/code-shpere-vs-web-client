import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/auth.context";
import { getAccessToken } from "@/lib/api-client";
import { notificationsApi } from "../notifications.api";
import { upsertNotificationInCache } from "../notifications-cache";
import { notificationsQueryOptionsFactory } from "../notifications-query-options-factory";
import type { Notification, NotificationsStreamUnreadCountEvent } from "../types";

const MAX_RETRY_DELAY_MS = 30000;

const parseSseData = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const useNotificationStream = (enabled = true) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeoutId: number | null = null;
    let retryAttempt = 0;
    let isDisposed = false;

    const unreadCountQueryKey = notificationsQueryOptionsFactory.unreadCount().queryKey;

    const connect = async () => {
      if (isDisposed) return;

      try {
        const { streamToken } = await notificationsApi.getStreamToken();
        if (isDisposed) return;

        eventSource?.close();
        eventSource = notificationsApi.createEventSource(streamToken);

        eventSource.onopen = () => {
          retryAttempt = 0;
        };

        eventSource.addEventListener("notification.created", (event) => {
          const nextNotification = parseSseData<Notification>(
            (event as MessageEvent<string>).data,
          );
          if (!nextNotification) return;

          upsertNotificationInCache(queryClient, nextNotification);

          queryClient.setQueryData<{ count: number }>(
            unreadCountQueryKey,
            (oldData) => ({
              count: (oldData?.count ?? 0) + 1,
            }),
          );

          const actorName =
            typeof nextNotification.payload?.actorName === "string"
              ? nextNotification.payload.actorName
              : "Someone";
          toast.info(`${actorName} sent you a new notification`);
        });

        eventSource.addEventListener("notification.unread_count", (event) => {
          const unreadPayload = parseSseData<NotificationsStreamUnreadCountEvent>(
            (event as MessageEvent<string>).data,
          );
          if (!unreadPayload) return;

          queryClient.setQueryData(unreadCountQueryKey, {
            count: unreadPayload.count,
          });
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          if (isDisposed) return;

          const delay = Math.min(
            1000 * 2 ** retryAttempt,
            MAX_RETRY_DELAY_MS,
          );
          retryAttempt += 1;
          reconnectTimeoutId = window.setTimeout(() => void connect(), delay);
        };
      } catch {
        if (isDisposed) return;
        const delay = Math.min(1000 * 2 ** retryAttempt, MAX_RETRY_DELAY_MS);
        retryAttempt += 1;
        reconnectTimeoutId = window.setTimeout(() => void connect(), delay);
      }
    };

    void connect();

    return () => {
      isDisposed = true;

      if (reconnectTimeoutId) {
        window.clearTimeout(reconnectTimeoutId);
      }

      if (eventSource) {
        eventSource.close();
      }
    };
  }, [enabled, isAuthenticated, queryClient]);
};
