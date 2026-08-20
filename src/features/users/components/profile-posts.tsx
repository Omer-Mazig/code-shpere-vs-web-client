import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { FeedSkeleton } from "@/features/posts/components/post-feed";
import { PostProfileFeed } from "@/features/posts/components/post-profile-feed";

type ProfilePostsProps = {
  userId: string;
};

export const ProfilePosts = ({ userId }: ProfilePostsProps) => {
  return (
    <QueryBoundary
      fallback={<FeedSkeleton />}
      ErrorFallback={InlineErrorFallback}
      resetKeys={[userId]}
    >
      <PostProfileFeed userId={userId} />
    </QueryBoundary>
  );
};
