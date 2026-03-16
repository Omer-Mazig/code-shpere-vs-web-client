import { CreatePostForm } from "@/features/posts/components/create-post-form";
import { PostFeed, FeedSkeleton } from "@/features/posts/components/post-feed";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { useCreatePost } from "@/features/posts/hooks/use-create-post";

export const FeedPage = () => {
  const createPost = useCreatePost();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Feed</h1>
      <div className="flex flex-col gap-6">
        <CreatePostForm createPost={createPost} />
        <QueryBoundary
          fallback={<FeedSkeleton />}
          ErrorFallback={InlineErrorFallback}
        >
          <PostFeed createPost={createPost} />
        </QueryBoundary>
      </div>
    </div>
  );
};
