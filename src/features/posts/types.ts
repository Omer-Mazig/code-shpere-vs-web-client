import type { components, paths } from "@/lib/api-types";

export type PostAuthor = components["schemas"]["PostAuthorResponseDto"];
export type PostCommentPreview = components["schemas"]["PostCommentPreviewResponseDto"];
export type Post = components["schemas"]["PostResponseDto"];

export type CreatePostDto = components["schemas"]["CreatePostDto"];
export type UpdatePostDto = components["schemas"]["UpdatePostDto"];
export type PostQueryDto =
  NonNullable<paths["/api/posts"]["get"]["parameters"]["query"]>;
