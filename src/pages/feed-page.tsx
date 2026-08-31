import { CreatePostForm } from "@/features/posts/components/create-post-form";
import { PostFeed, FeedSkeleton } from "@/features/posts/components/post-feed";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { useCreatePost } from "@/features/posts/hooks/use-create-post";
import { ProfileSidebarCard } from "@/features/users/components/profile-sidebar-card";
import {
  ShortcutsCard,
} from "@/features/users/components/profile-rail-cards";
import { WhoToFollowCard } from "@/features/users/components/who-to-follow-card";
import { TopicsToFollowCard } from "@/features/topics/components/topics-to-follow-card";
import { SuggestedArticlesCard } from "@/features/articles/components/suggested-articles-card";
import { AdCard } from "@/components/shared/ad-card";
import { SideCard } from "@/components/shared/side-card";

const FOOTER_LINKS = [
  "About",
  "Accessibility",
  "Help Center",
  "Privacy & Terms",
  "Ad Choices",
  "Get the app",
];

/**
 * Last card of the right rail. Sticks below the header once the rest of the
 * rail scrolls away, so it stays visible while the feed keeps scrolling
 */
const FooterCard = () => (
  <SideCard
    kicker="footer"
    contentClassName="flex flex-col gap-3"
  >
    <nav className="flex flex-wrap gap-x-3 gap-y-1.5">
      {FOOTER_LINKS.map((label) => (
        <span
          key={label}
          className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-primary hover:underline"
        >
          {label}
        </span>
      ))}
    </nav>
    <p className="font-mono text-[10px] text-muted-foreground/60">
      code<span className="text-primary">_</span>sphere ©{" "}
      {new Date().getFullYear()}
    </p>
  </SideCard>
);

export const FeedPage = () => {
  const createPost = useCreatePost();

  return (
    <div className="bg-grid-dots min-h-full">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <h1 className="sr-only">Feed</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          {/* Left rail — identity + quick actions, always pinned */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 flex flex-col gap-4">
              <ProfileSidebarCard />
              {/* <ProfileStatsCard /> */}
              <ShortcutsCard />
            </div>
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

          {/* Right rail — discovery. The rail scrolls with the page; the
              promoted + footer block sticks below the header once reached. */}
          <aside className="hidden xl:block">
            <div className="flex h-full flex-col gap-4">
              <SuggestedArticlesCard />
              <WhoToFollowCard />
              <TopicsToFollowCard />
              <div className="sticky top-20 flex flex-col gap-4">
                <AdCard />
                <FooterCard />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
