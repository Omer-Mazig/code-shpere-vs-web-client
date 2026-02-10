import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";
import type { UserProfile, UpdateProfileDto, FollowUser } from "./types";

export const usersApi = {
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get("/users/me");
    return response.data;
  },

  getProfile: async (targetUserId: string): Promise<UserProfile> => {
    const response = await apiClient.get(`/users/${targetUserId}`);
    return response.data;
  },

  updateMyProfile: async (dto: UpdateProfileDto): Promise<UserProfile> => {
    const response = await apiClient.patch("/users/me", dto);
    return response.data;
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
    const response = await apiClient.get(`/users/${userId}/followers`, {
      params: { page, limit },
    });
    return response.data;
  },

  getFollowing: async (
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<FollowUser>> => {
    const response = await apiClient.get(`/users/${userId}/following`, {
      params: { page, limit },
    });
    return response.data;
  },
};
