import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleDraftsList } from "@/features/articles/components/article-drafts-list";
import { PostDraftsList } from "@/features/posts/components/post-drafts-list";

const DraftsSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="h-28 w-full rounded-xl" />
    <Skeleton className="h-28 w-full rounded-xl" />
  </div>
);

export const DraftsPage = () => (
  <div className="container mx-auto max-w-2xl px-4 py-6">
    <h1 className="text-2xl font-bold tracking-tight">Drafts</h1>
    <p className="mt-1 text-sm text-muted-foreground">
      Unpublished posts and articles. Only you can see them.
    </p>

    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">Posts</h2>
      <QueryBoundary
        fallback={<DraftsSkeleton />}
        ErrorFallback={InlineErrorFallback}
      >
        <PostDraftsList />
      </QueryBoundary>
    </section>

    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">Articles</h2>
      <QueryBoundary
        fallback={<DraftsSkeleton />}
        ErrorFallback={InlineErrorFallback}
      >
        <ArticleDraftsList />
      </QueryBoundary>
    </section>
  </div>
);
