import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope, PaginatedResponse } from "@/lib/types";
import type { SaveTargetDto, SavedItem, SavedListQuery } from "./types";

export const savedApi = {
  list: async (
    query?: SavedListQuery,
  ): Promise<PaginatedResponse<SavedItem>> => {
    const response = await apiClient.get<
      ApiEnvelope<PaginatedResponse<SavedItem>>
    >("/me/saved", { params: query });
    return response.data.payload;
  },

  save: async (dto: SaveTargetDto): Promise<void> => {
    await apiClient.post("/me/saved", dto);
  },

  unsave: async (dto: SaveTargetDto): Promise<void> => {
    await apiClient.delete("/me/saved", { data: dto });
  },
};
