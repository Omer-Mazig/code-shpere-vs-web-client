import type { components } from "@/lib/api-types";

export type CommentAuthor = components["schemas"]["CommentAuthorResponseDto"];
export type CommentMentionCandidate =
  components["schemas"]["CommentMentionCandidateResponseDto"];
export type Comment = components["schemas"]["CommentResponseDto"];

export type CreateCommentDto = components["schemas"]["CreateCommentDto"];
export type UpdateCommentDto = components["schemas"]["UpdateCommentDto"];
