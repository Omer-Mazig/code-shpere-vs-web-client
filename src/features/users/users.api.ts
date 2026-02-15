import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope, PaginatedResponse } from "@/lib/types";
import type { UserProfile, UpdateProfileDto, FollowUser } from "./types";

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

  updateMyProfile: async (dto: UpdateProfileDto): Promise<UserProfile> => {
    const response = await apiClient.patch<ApiEnvelope<UserProfile>>(
      "/users/me",
      dto,
    );
    return response.data.payload;
  },

  follow: async (userId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/follow`);
  },

  unfollow: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/follow`);
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
