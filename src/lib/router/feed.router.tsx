import { useParams } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { FeedPage } from "@/pages/feed-page";
import {
  PostDetailPage,
  PostDetailSkeleton,
} from "@/pages/post-detail-page";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { PageErrorFallback } from "@/components/errors/page-error-fallback";

const PostDetailRoute = () => {
  const { id } = useParams();
  return (
    <QueryBoundary
      fallback={<PostDetailSkeleton />}
      ErrorFallback={PageErrorFallback}
      resetKeys={[id]}
    >
      <PostDetailPage />
    </QueryBoundary>
  );
};

export const feedRoutes: RouteObject[] = [
  {
    path: "feed",
    element: <FeedPage />,
  },
  {
    path: "feed/:id",
    element: <PostDetailRoute />,
  },
];
