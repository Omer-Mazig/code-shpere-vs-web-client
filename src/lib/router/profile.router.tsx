import type { RouteObject } from "react-router-dom";
import { ProfilePage } from "@/pages/profile-page";
import { EditProfilePage } from "@/pages/edit-profile-page";
import { RequireAuth } from "@/features/auth/components/require-auth";

export const profileRoutes: RouteObject[] = [
  {
    path: "profile/edit",
    element: (
      <RequireAuth>
        <EditProfilePage />
      </RequireAuth>
    ),
  },
  {
    path: "profile/:id",
    element: <ProfilePage />,
  },
];
