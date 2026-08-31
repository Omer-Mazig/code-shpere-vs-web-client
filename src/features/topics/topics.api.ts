import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope } from "@/lib/types";
import type { Topic } from "./types";

export const topicsApi = {
  list: async (): Promise<Topic[]> => {
    const response = await apiClient.get<ApiEnvelope<Topic[]>>("/topics");
    return response.data.payload;
  },

  follow: async (topicId: string): Promise<void> => {
    await apiClient.post(`/topics/${topicId}/follow`);
  },

  unfollow: async (topicId: string): Promise<void> => {
    await apiClient.delete(`/topics/${topicId}/follow`);
  },
};
