import type { RouteObject } from "react-router-dom";
import { ProfileSettingsPage } from "@/pages/profile-settings-page";
import {
  ProfileArticlesTabPage,
  ProfileFollowersTabPage,
  ProfileFollowingTabPage,
  ProfileIndexRedirectPage,
  ProfilePostsTabPage,
} from "@/pages/profile-tabs";

export const profileRoutes: RouteObject[] = [
  {
    path: "profile/:id",
    element: <ProfileIndexRedirectPage />,
  },
  {
    path: "profile/:id/posts",
    element: <ProfilePostsTabPage />,
  },
  {
    path: "profile/:id/articles",
    element: <ProfileArticlesTabPage />,
  },
  {
    path: "profile/:id/followers",
    element: <ProfileFollowersTabPage />,
  },
  {
    path: "profile/:id/following",
    element: <ProfileFollowingTabPage />,
  },
  {
    path: "profile/:id/settings",
    element: <ProfileSettingsPage />,
  },
];
