import { PostProfileFeed } from "@/features/posts/components/post-profile-feed";

type ProfilePostsProps = {
  userId: string;
};

export const ProfilePosts = ({ userId }: ProfilePostsProps) => {
  return <PostProfileFeed userId={userId} />;
};
