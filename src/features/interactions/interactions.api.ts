import { apiClient } from "@/lib/api-client";
import type { components } from "@/lib/api-types";

type LikeDto = components["schemas"]["LikeDto"];
type LikeTargetType = LikeDto["targetType"];

export const interactionsApi = {
  like: async (targetId: string, targetType: LikeTargetType): Promise<void> => {
    await apiClient.post("/interactions/likes", { targetId, targetType });
  },

  unlike: async (
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<void> => {
    await apiClient.delete("/interactions/likes", {
      data: { targetId, targetType },
    });
  },

  share: async (targetId: string, targetType: LikeTargetType): Promise<void> => {
    await apiClient.post("/interactions/shares", { targetId, targetType });
  },
};
