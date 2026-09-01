import { useParams } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { ArticlesPage } from "@/pages/articles-page";
import {
  ArticleDetailPage,
  ArticleDetailSkeleton,
} from "@/pages/article-detail-page";
import { CreateArticlePage } from "@/pages/create-article-page";
import { EditArticlePage } from "@/pages/edit-article-page";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { PageErrorFallback } from "@/components/errors/page-error-fallback";

const ArticleDetailRoute = () => {
  const { slug } = useParams();
  return (
    <QueryBoundary
      fallback={<ArticleDetailSkeleton />}
      ErrorFallback={PageErrorFallback}
      resetKeys={[slug]}
    >
      <ArticleDetailPage />
    </QueryBoundary>
  );
};

export const articleRoutes: RouteObject[] = [
  {
    path: "articles",
    element: <ArticlesPage />,
  },
  {
    path: "articles/new",
    element: (
      <RequireAuth>
        <CreateArticlePage />
      </RequireAuth>
    ),
  },
  {
    path: "articles/:slug",
    element: <ArticleDetailRoute />,
  },
  {
    path: "articles/:slug/edit",
    element: (
      <RequireAuth>
        <EditArticlePage />
      </RequireAuth>
    ),
  },
];
