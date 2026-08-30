import { ArticleList, ArticleListSkeleton } from "@/features/articles/components/article-list";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";

export const ArticlesPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <p className="text-muted-foreground mt-1">
          Discover in-depth articles from the developer community.
        </p>
      </div>
      <QueryBoundary
        fallback={<ArticleListSkeleton />}
        ErrorFallback={InlineErrorFallback}
      >
        <ArticleList queryDto={{ isPublished: true }} />
      </QueryBoundary>
    </div>
  );
};
