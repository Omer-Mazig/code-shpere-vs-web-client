import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope, PaginatedResponse } from "@/lib/types";
import type {
  Article,
  CreateArticleDto,
  UpdateArticleDto,
  ArticleQueryDto,
} from "./types";

export const articlesApi = {
  list: async (
    query?: Partial<ArticleQueryDto>,
  ): Promise<PaginatedResponse<Article>> => {
    const response = await apiClient.get<ApiEnvelope<PaginatedResponse<Article>>>(
      "/articles",
      { params: query },
    );
    return response.data.payload;
  },

  getBySlug: async (slug: string): Promise<Article> => {
    const response = await apiClient.get<ApiEnvelope<Article>>(
      `/articles/${slug}`,
    );
    return response.data.payload;
  },

  create: async (dto: CreateArticleDto): Promise<Article> => {
    const response = await apiClient.post<ApiEnvelope<Article>>("/articles", dto);
    return response.data.payload;
  },

  update: async (id: string, dto: UpdateArticleDto): Promise<Article> => {
    const response = await apiClient.patch<ApiEnvelope<Article>>(
      `/articles/${id}`,
      dto,
    );
    return response.data.payload;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/articles/${id}`);
  },
};
