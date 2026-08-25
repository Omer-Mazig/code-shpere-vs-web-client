import type { components, paths } from "@/lib/api-types";

export type PostAuthor = components["schemas"]["PostAuthorResponseDto"];
export type PostCommentPreview = components["schemas"]["PostCommentPreviewResponseDto"];

export type SharedPostPreview = {
  id: string;
  content: string;
  author: PostAuthor | null;
  createdAt: string;
};

export type Post = components["schemas"]["PostResponseDto"] & {
  sharesCount: number;
  isShared: boolean;
  sharedPost: SharedPostPreview | null;
};

export type CreatePostDto = Omit<
  components["schemas"]["CreatePostDto"],
  "content"
> & {
  content?: string;
  sharedPostId?: string;
};
export type UpdatePostDto = components["schemas"]["UpdatePostDto"];
export type PostQueryDto =
  NonNullable<paths["/api/posts"]["get"]["parameters"]["query"]>;
