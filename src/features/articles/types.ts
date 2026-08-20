import type { components, paths } from "@/lib/api-types";

export type ArticleAuthor = components["schemas"]["ArticleAuthorResponseDto"];
export type Article = components["schemas"]["ArticleResponseDto"] & {
  commentsCount?: number;
};
export type CreateArticleDto = components["schemas"]["CreateArticleDto"];
export type UpdateArticleDto = components["schemas"]["UpdateArticleDto"];
export type ArticleQueryDto =
  NonNullable<paths["/api/articles"]["get"]["parameters"]["query"]>;
