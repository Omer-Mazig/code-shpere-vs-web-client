import { CreatePostForm } from "@/features/posts/components/create-post-form";
import { PostFeed } from "@/features/posts/components/post-feed";

export const FeedPage = () => {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Feed</h1>
      <div className="flex flex-col gap-6">
        <CreatePostForm />
        <PostFeed />
      </div>
    </div>
  );
};
