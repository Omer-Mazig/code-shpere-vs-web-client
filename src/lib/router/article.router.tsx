import type { RouteObject } from "react-router-dom";
import { ArticlesPage } from "@/pages/articles-page";
import { ArticleDetailPage } from "@/pages/article-detail-page";
import { CreateArticlePage } from "@/pages/create-article-page";
import { RequireAuth } from "@/features/auth/components/require-auth";

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
    element: <ArticleDetailPage />,
  },
  {
    path: "articles/:slug/edit",
    element: (
      <RequireAuth>
        <CreateArticlePage />
      </RequireAuth>
    ),
  },
];
