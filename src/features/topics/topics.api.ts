import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/lib/types";
import type { Topic, TopicDetail } from "./types";

export const topicsApi = {
  list: async (): Promise<Topic[]> => {
    const response = await apiClient.get<ApiEnvelope<Topic[]>>("/topics");
    return response.data.payload;
  },

  getBySlug: async (slug: string): Promise<TopicDetail> => {
    const response = await apiClient.get<ApiEnvelope<TopicDetail>>(
      `/topics/${slug}`,
    );
    return response.data.payload;
  },

  follow: async (topicId: string): Promise<void> => {
    await apiClient.post(`/topics/${topicId}/follow`);
  },

  unfollow: async (topicId: string): Promise<void> => {
    await apiClient.delete(`/topics/${topicId}/follow`);
  },
};
