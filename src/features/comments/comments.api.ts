import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope, PaginatedResponse } from "@/lib/types";
import type {
  Comment,
  CommentMentionCandidate,
  CommentMentionCandidatesQueryDto,
  CommentsQueryDto,
  CommentTargetType,
  CreateCommentDto,
  UpdateCommentDto,
} from "./types";

export const commentsApi = {
  getComments: async (
    targetId: string,
    targetType: CommentTargetType,
    page = 1,
    limit = 20,
    parentId?: string,
  ): Promise<PaginatedResponse<Comment>> => {
    const params: CommentsQueryDto = {
      targetId,
      targetType,
      page,
      limit,
      parentId,
    };
    const response = await apiClient.get<ApiEnvelope<PaginatedResponse<Comment>>>(
      "/interactions/comments",
      { params },
    );
    return response.data.payload;
  },

  getReplies: async (
    commentId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Comment>> => {
    const response = await apiClient.get<ApiEnvelope<PaginatedResponse<Comment>>>(
      `/interactions/comments/${commentId}/replies`,
      {
        params: { page, limit },
      },
    );
    return response.data.payload;
  },

  getMentionCandidates: async (
    targetId: string,
    targetType: CommentTargetType,
    parentId?: string,
    query?: string,
  ): Promise<CommentMentionCandidate[]> => {
    const params: CommentMentionCandidatesQueryDto = {
      targetId,
      targetType,
      parentId,
      query,
    };
    const response = await apiClient.get<ApiEnvelope<CommentMentionCandidate[]>>(
      "/interactions/comments/mention-candidates",
      { params },
    );
    return response.data.payload;
  },

  addComment: async (dto: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post<ApiEnvelope<Comment>>(
      "/interactions/comments",
      dto,
    );
    return response.data.payload;
  },

  updateComment: async (
    id: string,
    dto: UpdateCommentDto,
  ): Promise<Comment> => {
    const response = await apiClient.patch<ApiEnvelope<Comment>>(
      `/interactions/comments/${id}`,
      dto,
    );
    return response.data.payload;
  },

  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/interactions/comments/${id}`);
  },
};
