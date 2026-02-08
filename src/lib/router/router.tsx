import { createBrowserRouter, Navigate } from "react-router-dom";

import { RootLayout } from "@/components/layout/root-layout";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { NotFoundPage } from "@/pages/not-found-page";

import { authRoutes } from "./auth.router";
import { feedRoutes } from "./feed.router";
import { articleRoutes } from "./article.router";
import { profileRoutes } from "./profile.router";
import { AUTH_PATHS, FEED_PATHS } from "../routes.constants";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Auth routes (sign-in, sign-up - no navbar)
      {
        path: AUTH_PATHS.AUTH.slice(1), // "auth"
        element: <AuthLayout />,
        children: authRoutes,
      },
      // Main app routes (with navbar)
      {
        element: <AppLayout />,
        children: [
          // Redirect index to feed
          {
            index: true,
            element: <Navigate to={FEED_PATHS.FEED} replace />,
          },
          ...feedRoutes,
          ...articleRoutes,
          ...profileRoutes,
        ],
      },
      // Catch-all route for undefined paths
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
