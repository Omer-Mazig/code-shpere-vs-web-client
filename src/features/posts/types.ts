import type { components, operations, paths } from "@/lib/api-types";

export type PostAuthor = components["schemas"]["PostAuthorResponseDto"];
export type PostCommentPreview =
  components["schemas"]["PostCommentPreviewResponseDto"];
export type SharedPostPreview =
  components["schemas"]["SharedPostPreviewResponseDto"];
export type PostImage = components["schemas"]["PostImageResponseDto"];
export type PostImageLayout = components["schemas"]["PostImageLayout"];
export type Post = components["schemas"]["PostResponseDto"];
export type CreatePostDto = components["schemas"]["CreatePostDto"];
export type UpdatePostDto = components["schemas"]["UpdatePostDto"];
export type PostQueryDto = NonNullable<
  paths["/api/posts"]["get"]["parameters"]["query"]
>;
export type PostDraftsQueryDto = NonNullable<
  operations["PostsController_getMyDrafts"]["parameters"]["query"]
>;
