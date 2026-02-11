import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types";
import type { Post, CreatePostDto, UpdatePostDto, PostQueryDto } from "./types";

export const postsApi = {
  getFeed: async (
    query?: Partial<PostQueryDto>,
  ): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get("/posts", { params: query });
    return response.data.payload;
  },

  getById: async (id: string): Promise<Post> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data.payload;
  },

  create: async (dto: CreatePostDto): Promise<Post> => {
    const response = await apiClient.post("/posts", dto);
    return response.data.payload;
  },

  update: async (id: string, dto: UpdatePostDto): Promise<Post> => {
    const response = await apiClient.patch(`/posts/${id}`, dto);
    return response.data.payload;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },
};
