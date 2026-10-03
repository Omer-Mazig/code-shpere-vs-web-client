import { apiClient } from "@/lib/api-client";
import type { ApiEnvelope, PaginatedResponse } from "@/lib/types";
import type {
  Article,
  ArticleListAuthor,
  CreateArticleDto,
  UpdateArticleDto,
  ArticleQueryDto,
  ArticleDraftsQueryDto,
} from "./types";

export const articlesApi = {
  list: async (
    query?: Partial<ArticleQueryDto>,
  ): Promise<PaginatedResponse<Article>> => {
    const response = await apiClient.get<
      ApiEnvelope<PaginatedResponse<Article>>
    >("/articles", { params: query });
    return response.data.payload;
  },

  listPublishedAuthors: async (): Promise<ArticleListAuthor[]> => {
    const response =
      await apiClient.get<ApiEnvelope<ArticleListAuthor[]>>(
        "/articles/authors",
      );
    return response.data.payload;
  },

  getSuggestions: async (limit = 4): Promise<PaginatedResponse<Article>> => {
    const response = await apiClient.get<
      ApiEnvelope<PaginatedResponse<Article>>
    >("/articles/suggestions", { params: { limit } });
    return response.data.payload;
  },

  listDrafts: async (
    query?: ArticleDraftsQueryDto,
  ): Promise<PaginatedResponse<Article>> => {
    const response = await apiClient.get<
      ApiEnvelope<PaginatedResponse<Article>>
    >("/articles/me/drafts", { params: query });
    return response.data.payload;
  },

  getBySlug: async (slug: string): Promise<Article> => {
    const response = await apiClient.get<ApiEnvelope<Article>>(
      `/articles/${slug}`,
    );
    return response.data.payload;
  },

  create: async (dto: CreateArticleDto): Promise<Article> => {
    const response = await apiClient.post<ApiEnvelope<Article>>(
      "/articles",
      dto,
    );
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
