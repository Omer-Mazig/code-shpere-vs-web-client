import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope, PaginatedResponse } from "@/lib/types";
import type {
  UserProfile,
  UpdateProfileDto,
  FollowUser,
  SuggestedUser,
  UserPreview,
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
} from "./types";

export const usersApi = {
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiEnvelope<UserProfile>>("/users/me");
    return response.data.payload;
  },

  getProfile: async (targetUserId: string): Promise<UserProfile> => {
    const response = await apiClient.get<ApiEnvelope<UserProfile>>(
      `/users/${targetUserId}`,
    );
    return response.data.payload;
  },

  getProfilePreview: async (targetUserId: string): Promise<UserPreview> => {
    const response = await apiClient.get<ApiEnvelope<UserPreview>>(
      `/users/${targetUserId}/preview`,
    );
    return response.data.payload;
  },

  updateMyProfile: async (dto: UpdateProfileDto): Promise<UserProfile> => {
    const response = await apiClient.patch<ApiEnvelope<UserProfile>>(
      "/users/me",
      dto,
    );
    return response.data.payload;
  },

  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<ApiEnvelope<NotificationPreferences>>(
      "/users/me/notification-preferences",
    );
    return response.data.payload;
  },

  updateNotificationPreferences: async (
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferences> => {
    const response = await apiClient.patch<
      ApiEnvelope<NotificationPreferences>
    >("/users/me/notification-preferences", dto);
    return response.data.payload;
  },

  follow: async (userId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/follow`);
  },

  unfollow: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/follow`);
  },

  getSuggestions: async (
    limit = 5,
  ): Promise<PaginatedResponse<SuggestedUser>> => {
    const response = await apiClient.get<
      ApiEnvelope<PaginatedResponse<SuggestedUser>>
    >("/users/suggestions", { params: { limit } });
    return response.data.payload;
  },

  getFollowers: async (
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<FollowUser>> => {
    const response = await apiClient.get<ApiEnvelope<PaginatedResponse<FollowUser>>>(
      `/users/${userId}/followers`,
      {
        params: { page, limit },
      },
    );
    return response.data.payload;
  },

  getFollowing: async (
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<FollowUser>> => {
    const response = await apiClient.get<ApiEnvelope<PaginatedResponse<FollowUser>>>(
      `/users/${userId}/following`,
      {
        params: { page, limit },
      },
    );
    return response.data.payload;
  },
};
