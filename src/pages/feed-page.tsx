import { CreatePostForm } from "@/features/posts/components/create-post-form";
import { PostFeed, FeedSkeleton } from "@/features/posts/components/post-feed";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { useCreatePost } from "@/features/posts/hooks/use-create-post";
import { ProfileSidebarCard } from "@/features/users/components/profile-sidebar-card";
import { WhoToFollowCard } from "@/features/users/components/who-to-follow-card";
import { SuggestedArticlesCard } from "@/features/articles/components/suggested-articles-card";
import { AdCard } from "@/components/shared/ad-card";

const RailFooter = () => (
  <p className="px-2 text-center font-mono text-[10px] leading-relaxed text-muted-foreground/60">
    about · privacy · terms
    <br />
    CodeSphere © {new Date().getFullYear()}
  </p>
);

export const FeedPage = () => {
  const createPost = useCreatePost();

  return (
    <div className="bg-grid-dots min-h-full">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <h1 className="sr-only">Feed</h1>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          {/* Left rail — identity */}
          <aside className="sticky top-20 hidden lg:block">
            <ProfileSidebarCard />
          </aside>

          {/* Center — composer + feed */}
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <div className="animate-fade-up">
              <CreatePostForm createPost={createPost} />
            </div>
            <QueryBoundary
              fallback={<FeedSkeleton />}
              ErrorFallback={InlineErrorFallback}
            >
              <PostFeed createPost={createPost} />
            </QueryBoundary>
          </div>

          {/* Right rail — discovery */}
          <aside className="sticky top-20 hidden xl:flex xl:flex-col xl:gap-4">
            <SuggestedArticlesCard />
            <WhoToFollowCard />
            <AdCard />
            <RailFooter />
          </aside>
        </div>
      </div>
    </div>
  );
};
