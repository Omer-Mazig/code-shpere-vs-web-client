export type PostAuthor = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type Post = {
  id: string;
  content: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostDto = {
  content: string;
};

export type UpdatePostDto = {
  content: string;
};

export type PostQueryDto = {
  page?: number;
  limit?: number;
  authorId?: string;
};
