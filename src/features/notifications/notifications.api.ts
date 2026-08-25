import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope, PaginatedResponse } from "@/lib/types";
import type {
  MarkAllReadResponse,
  Notification,
  NotificationsListFilters,
  StreamTokenResponse,
  UnreadNotificationsCount,
} from "./types";

const baseURL = import.meta.env.VITE_API_URL ?? "";

export const notificationsApi = {
  getNotifications: async (
    page = 1,
    limit = 20,
    filters?: NotificationsListFilters,
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<
      ApiEnvelope<PaginatedResponse<Notification>>
    >("/notifications", {
      params: {
        page,
        limit,
        targetType: filters?.targetType,
        isRead: filters?.isRead,
      },
    });

    return response.data.payload;
  },

  getUnreadCount: async (): Promise<UnreadNotificationsCount> => {
    const response = await apiClient.get<ApiEnvelope<UnreadNotificationsCount>>(
      "/notifications/unread-count",
    );
    return response.data.payload;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<ApiEnvelope<Notification>>(
      `/notifications/${id}/read`,
    );
    return response.data.payload;
  },

  markAllAsRead: async (): Promise<MarkAllReadResponse> => {
    const response = await apiClient.patch<ApiEnvelope<MarkAllReadResponse>>(
      "/notifications/mark-all-read",
    );
    return response.data.payload;
  },

  getStreamToken: async (): Promise<StreamTokenResponse> => {
    const response = await apiClient.post<ApiEnvelope<StreamTokenResponse>>(
      "/notifications/stream-token",
    );
    return response.data.payload;
  },

  createEventSource: (streamToken: string): EventSource => {
    const streamUrl = `${baseURL}/api/notifications/stream?streamToken=${encodeURIComponent(streamToken)}`;
    return new EventSource(streamUrl, { withCredentials: true });
  },
};
