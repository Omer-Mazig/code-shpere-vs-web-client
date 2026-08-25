import { apiClient } from "@/lib/api-client";
import type { LikeDto, LikeTargetType } from "./types";

export const interactionsApi = {
  like: async (targetId: string, targetType: LikeTargetType): Promise<void> => {
    const dto: LikeDto = { targetId, targetType };
    await apiClient.post("/interactions/likes", dto);
  },

  unlike: async (
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<void> => {
    const dto: LikeDto = { targetId, targetType };
    await apiClient.delete("/interactions/likes", {
      data: dto,
    });
  },

  share: async (targetId: string, targetType: LikeTargetType): Promise<void> => {
    const dto: LikeDto = { targetId, targetType };
    await apiClient.post("/interactions/shares", dto);
  },
};
