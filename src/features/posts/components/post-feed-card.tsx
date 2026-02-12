import { useNavigate } from "react-router-dom";
import type { Post as PostType } from "../types";
import { Post } from "./post-card";

type PostFeedCardProps = {
  post: PostType;
};

export const PostFeedCard = ({ post }: PostFeedCardProps) => {
  const navigate = useNavigate();

  return (
    <Post.Root post={post}>
      <Post.Header rightSlot={<Post.FollowAuthorButton />} />
      <Post.Content />
      <Post.CommentPreview />
      <Post.ActionsBar onCommentClick={() => navigate(`/feed/${post.id}`)} />
    </Post.Root>
  );
};
