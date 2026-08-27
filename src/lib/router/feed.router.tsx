import type { RouteObject } from "react-router-dom";
import { FeedPage } from "@/pages/feed-page";
import { PostDetailPage } from "@/pages/post-detail-page";
import { NotificationsPage } from "@/pages/notifications-page";
import { RequireAuth } from "@/features/auth/components/require-auth";

export const feedRoutes: RouteObject[] = [
  {
    path: "feed",
    element: (
      <RequireAuth>
        <FeedPage />
      </RequireAuth>
    ),
  },
  {
    path: "feed/:id",
    element: (
      <RequireAuth>
        <PostDetailPage />
      </RequireAuth>
    ),
  },
  {
    path: "notifications",
    element: (
      <RequireAuth>
        <NotificationsPage />
      </RequireAuth>
    ),
  },
];
