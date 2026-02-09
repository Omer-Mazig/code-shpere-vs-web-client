import { apiClient } from "@/lib/api-client";

export const interactionsApi = {
  like: async (
    targetId: string,
    targetType: "POST" | "ARTICLE",
  ): Promise<void> => {
    await apiClient.post("/interactions/likes", { targetId, targetType });
  },

  unlike: async (
    targetId: string,
    targetType: "POST" | "ARTICLE",
  ): Promise<void> => {
    await apiClient.delete("/interactions/likes", {
      data: { targetId, targetType },
    });
  },
};
