import type { components, paths } from "@/lib/api-types";

export type CommentAuthor = components["schemas"]["CommentAuthorResponseDto"];
export type CommentMentionCandidate =
  components["schemas"]["CommentMentionCandidateResponseDto"];
export type Comment = components["schemas"]["CommentResponseDto"];
export type CreateCommentDto = components["schemas"]["CreateCommentDto"];
export type UpdateCommentDto = components["schemas"]["UpdateCommentDto"];
export type CommentsQueryDto = NonNullable<
  paths["/api/interactions/comments"]["get"]["parameters"]["query"]
>;
export type CommentMentionCandidatesQueryDto = NonNullable<
  paths["/api/interactions/comments/mention-candidates"]["get"]["parameters"]["query"]
>;
export type CommentTargetType = CommentsQueryDto["targetType"];
