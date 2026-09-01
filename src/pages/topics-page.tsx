import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { TopicDirectory, TopicDirectorySkeleton } from "@/features/topics/components/topic-directory";

export const TopicsPage = () => (
  <div className="container mx-auto max-w-4xl px-4 py-6">
    <div className="mb-8">
      <h1 className="text-2xl font-bold">Topics</h1>
      <p className="mt-1 text-muted-foreground">
        Browse curated developer topics. Follow a topic to find it here — this
        does not change your home feed.
      </p>
    </div>
    <QueryBoundary
      fallback={<TopicDirectorySkeleton />}
      ErrorFallback={InlineErrorFallback}
    >
      <TopicDirectory />
    </QueryBoundary>
  </div>
);
