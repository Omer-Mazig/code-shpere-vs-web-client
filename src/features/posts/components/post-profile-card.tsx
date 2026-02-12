import { useNavigate } from "react-router-dom";
import type { Post as PostType } from "../types";
import { Post } from "./post-card";

type PostProfileCardProps = {
  post: PostType;
};

export const PostProfileCard = ({ post }: PostProfileCardProps) => {
  const navigate = useNavigate();

  return (
    <Post.Root post={post}>
      <Post.Header />
      <Post.Content />
      <Post.CommentPreview />
      <Post.ActionsBar onCommentClick={() => navigate(`/feed/${post.id}`)} />
    </Post.Root>
  );
};
