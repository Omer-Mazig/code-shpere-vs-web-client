import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/auth.context";
import { SETTINGS_PATHS } from "@/lib/routes.constants";

export const ProfileSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const isOwnProfile = Boolean(id && isAuthenticated && user?.id === id);

  if (!id) {
    return (
      <Navigate
        to="/feed"
        replace
      />
    );
  }

  if (!isOwnProfile) {
    return (
      <Navigate
        to={`/profile/${id}/posts`}
        replace
      />
    );
  }

  return (
    <Navigate
      to={SETTINGS_PATHS.ROOT}
      replace
    />
  );
};
