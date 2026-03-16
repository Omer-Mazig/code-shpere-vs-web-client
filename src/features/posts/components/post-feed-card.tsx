import React from "react";
import { useNavigate } from "react-router-dom";
import type { Post as PostType } from "../types";
import { Post } from "./post-card";

type PostFeedCardProps = {
  post: PostType;
  isNew?: boolean;
};

export const PostFeedCard = ({ post, isNew }: PostFeedCardProps) => {
  const navigate = useNavigate();
  const [isHighlighting, setIsHighlighting] = React.useState(isNew ?? false);

  React.useEffect(() => {
    if (!isNew) return;

    setIsHighlighting(true);
    const timeout = setTimeout(() => {
      setIsHighlighting(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, [isNew]);

  return (
    <div
      className={
        isHighlighting
          ? "animate-[pulse_0.6s_ease-out] rounded-lg bg-primary/5"
          : undefined
      }
    >
      <Post.Root post={post}>
        <Post.Header rightSlot={<Post.FollowAuthorButton />} />
        <Post.Content />
        <Post.CommentPreview />
        <Post.ActionsBar onCommentClick={() => navigate(`/feed/${post.id}`)} />
      </Post.Root>
    </div>
  );
};
