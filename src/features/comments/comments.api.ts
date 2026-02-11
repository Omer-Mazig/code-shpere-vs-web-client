import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";
import type { Comment, CreateCommentDto, UpdateCommentDto } from "./types";

export const commentsApi = {
  getComments: async (
    targetId: string,
    targetType: "POST" | "ARTICLE",
    page = 1,
    limit = 20,
    parentId?: string,
  ): Promise<PaginatedResponse<Comment>> => {
    const response = await apiClient.get("/interactions/comments", {
      params: { targetId, targetType, page, limit, parentId },
    });
    return response.data.payload;
  },

  getReplies: async (
    commentId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Comment>> => {
    const response = await apiClient.get(`/interactions/comments/${commentId}/replies`, {
      params: { page, limit },
    });
    return response.data.payload;
  },

  addComment: async (dto: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post("/interactions/comments", dto);
    return response.data.payload;
  },

  updateComment: async (
    id: string,
    dto: UpdateCommentDto,
  ): Promise<Comment> => {
    const response = await apiClient.patch(
      `/interactions/comments/${id}`,
      dto,
    );
    return response.data.payload;
  },

  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/interactions/comments/${id}`);
  },
};
