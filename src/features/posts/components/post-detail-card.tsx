import type { Post as PostType } from "../types";
import { Post } from "./post-card";

type PostDetailCardProps = {
  post: PostType;
};

export const PostDetailCard = ({ post }: PostDetailCardProps) => {
  return (
    <Post.Root post={post}>
      <Post.Header rightSlot={<Post.FollowAuthorButton />} />
      <Post.Content linkToDetail={false} />
      <Post.ActionsBar />
    </Post.Root>
  );
};
