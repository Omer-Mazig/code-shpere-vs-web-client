import type { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { SettingsLayout } from "@/features/users/components/settings-layout";
import { SettingsHubPage } from "@/pages/settings-page";
import { SettingsProfilePage } from "@/pages/settings-profile-page";
import { SettingsAccountPage } from "@/pages/settings-account-page";
import { SettingsNotificationsPage } from "@/pages/settings-notifications-page";

export const settingsRoutes: RouteObject[] = [
  {
    path: "settings",
    element: (
      <RequireAuth>
        <SettingsLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SettingsHubPage />,
      },
      {
        path: "profile",
        element: <SettingsProfilePage />,
      },
      {
        path: "account",
        element: <SettingsAccountPage />,
      },
      {
        path: "notifications",
        element: <SettingsNotificationsPage />,
      },
    ],
  },
];
