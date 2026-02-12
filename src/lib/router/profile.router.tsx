import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ProfilePage } from "@/pages/profile-page";
import {
  ProfileArticlesTabPage,
  ProfileFollowersTabPage,
  ProfileFollowingTabPage,
  ProfilePostsTabPage,
  ProfileSettingsTabPage,
} from "@/pages/profile-tabs";

export const profileRoutes: RouteObject[] = [
  {
    path: "profile/:id",
    element: <ProfilePage />,
    children: [
      {
        index: true,
        element: <Navigate to="posts" replace />,
      },
      {
        path: "posts",
        element: <ProfilePostsTabPage />,
      },
      {
        path: "articles",
        element: <ProfileArticlesTabPage />,
      },
      {
        path: "followers",
        element: <ProfileFollowersTabPage />,
      },
      {
        path: "following",
        element: <ProfileFollowingTabPage />,
      },
      {
        path: "settings",
        element: <ProfileSettingsTabPage />,
      },
    ],
  },
];
