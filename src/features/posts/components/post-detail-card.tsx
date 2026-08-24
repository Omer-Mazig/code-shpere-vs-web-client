import { useNavigate } from "react-router-dom";
import type { Post as PostType } from "../types";
import { Post } from "./post-card";
import { FEED_PATHS } from "@/lib/routes.constants";

type PostDetailCardProps = {
  post: PostType;
};

export const PostDetailCard = ({ post }: PostDetailCardProps) => {
  const navigate = useNavigate();

  return (
    <Post.Root
      post={post}
      onDeleted={() => navigate(FEED_PATHS.FEED, { replace: true })}
    >
      <Post.Header rightSlot={<Post.FollowAuthorButton />} />
      <Post.Content linkToDetail={false} />
      <Post.ActionsBar />
    </Post.Root>
  );
};
