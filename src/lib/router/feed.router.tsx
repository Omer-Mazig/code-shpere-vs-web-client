import type { RouteObject } from "react-router-dom";
import { FeedPage } from "@/pages/feed-page";
import { PostDetailPage } from "@/pages/post-detail-page";

export const feedRoutes: RouteObject[] = [
  {
    path: "feed",
    element: <FeedPage />,
  },
  {
    path: "feed/:id",
    element: <PostDetailPage />,
  },
];
