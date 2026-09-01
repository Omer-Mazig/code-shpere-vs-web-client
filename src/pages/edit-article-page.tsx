import { Navigate, useParams } from "react-router-dom";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { PageErrorFallback } from "@/components/errors/page-error-fallback";
import { ArticleDetailSkeleton } from "@/pages/article-detail-page";
import { EditArticleForm } from "@/features/articles/components/edit-article-form";
import { ARTICLE_PATHS } from "@/lib/routes.constants";

export const EditArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) {
    return (
      <Navigate
        to={ARTICLE_PATHS.ARTICLES}
        replace
      />
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Edit article</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Update the markdown, save a draft, or publish. Deleting cannot be undone.
      </p>
      <QueryBoundary
        fallback={<ArticleDetailSkeleton />}
        ErrorFallback={PageErrorFallback}
        resetKeys={[slug]}
      >
        <EditArticleForm slug={slug} />
      </QueryBoundary>
    </div>
  );
};
