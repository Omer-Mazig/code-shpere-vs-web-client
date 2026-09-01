import type { components, paths } from "@/lib/api-types";

export type ArticleAuthor = components["schemas"]["ArticleAuthorResponseDto"];
export type ArticleListAuthor =
  components["schemas"]["ArticleListAuthorResponseDto"];
export type Article = components["schemas"]["ArticleResponseDto"];
export type CreateArticleDto = components["schemas"]["CreateArticleDto"];
export type UpdateArticleDto = components["schemas"]["UpdateArticleDto"];
export type ArticleQueryDto =
  NonNullable<paths["/api/articles"]["get"]["parameters"]["query"]>;
