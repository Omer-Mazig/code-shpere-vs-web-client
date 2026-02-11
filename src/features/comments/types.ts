export type CommentAuthor = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type CommentMentionCandidate = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type Comment = {
  id: string;
  content: string;
  targetId: string;
  targetType: "POST" | "ARTICLE";
  parentId: string | null;
  depth: number;
  likesCount: number;
  isLiked: boolean;
  repliesCount: number;
  mentionedUsers: CommentMentionCandidate[];
  author: CommentAuthor | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCommentDto = {
  content: string;
  targetId: string;
  targetType: "POST" | "ARTICLE";
  parentId?: string;
};

export type UpdateCommentDto = {
  content: string;
};
