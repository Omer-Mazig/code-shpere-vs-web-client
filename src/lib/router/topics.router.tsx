import { useParams } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { TopicsPage } from "@/pages/topics-page";
import { TopicHubPage, TopicHubSkeleton } from "@/pages/topic-hub-page";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { PageErrorFallback } from "@/components/errors/page-error-fallback";

const TopicHubRoute = () => {
  const { slug } = useParams();
  return (
    <QueryBoundary
      fallback={<TopicHubSkeleton />}
      ErrorFallback={PageErrorFallback}
      resetKeys={[slug]}
    >
      <TopicHubPage />
    </QueryBoundary>
  );
};

export const topicsRoutes: RouteObject[] = [
  {
    path: "topics",
    element: <TopicsPage />,
  },
  {
    path: "topics/:slug",
    element: <TopicHubRoute />,
  },
];
