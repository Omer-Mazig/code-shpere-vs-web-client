import { PostFeed } from "@/features/posts/components/post-feed";

type ProfilePostsProps = {
  userId: string;
};

export const ProfilePosts = ({ userId }: ProfilePostsProps) => {
  return <PostFeed queryDto={{ authorId: userId }} />;
};
