import { CreatePostForm } from "@/features/posts/components/create-post-form";
import { PostFeed, FeedSkeleton } from "@/features/posts/components/post-feed";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { useCreatePost } from "@/features/posts/hooks/use-create-post";

export const FeedPage = () => {
  const createPost = useCreatePost();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What the community is building, shipping, and thinking about.
        </p>
      </div>
      <div className="flex flex-col gap-4">
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
