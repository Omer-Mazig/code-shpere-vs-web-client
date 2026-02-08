export type ArticleAuthor = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: Record<string, unknown>[];
  coverImageUrl: string | null;
  isPublished: boolean;
  author: ArticleAuthor | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateArticleDto = {
  title: string;
  content: Record<string, unknown>[];
  coverImageUrl?: string;
  isPublished?: boolean;
};

export type UpdateArticleDto = {
  title?: string;
  content?: Record<string, unknown>[];
  coverImageUrl?: string;
  isPublished?: boolean;
};

export type ArticleQueryDto = {
  page?: number;
  limit?: number;
  authorId?: string;
  search?: string;
  isPublished?: boolean;
};
