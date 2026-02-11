export type CommentAuthor = {
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
