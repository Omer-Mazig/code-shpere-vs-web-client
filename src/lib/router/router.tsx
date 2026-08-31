import { createBrowserRouter, Navigate } from "react-router-dom";

import { RootLayout } from "@/components/layout/root-layout";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { NotFoundPage } from "@/pages/not-found-page";
import { useAuth } from "@/features/auth/auth.context";

import { authRoutes } from "./auth.router";
import { feedRoutes } from "./feed.router";
import { articleRoutes } from "./article.router";
import { profileRoutes } from "./profile.router";
import { settingsRoutes } from "./settings.router";
import { AUTH_PATHS, ARTICLE_PATHS, FEED_PATHS } from "../routes.constants";

const HomeIndexRedirect = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Navigate
      to={isAuthenticated ? FEED_PATHS.FEED : ARTICLE_PATHS.ARTICLES}
      replace
    />
  );
};

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
          {
            index: true,
            element: <HomeIndexRedirect />,
          },
          ...feedRoutes,
          ...articleRoutes,
          ...profileRoutes,
          ...settingsRoutes,
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
