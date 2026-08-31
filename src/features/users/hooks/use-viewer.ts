import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth.context";
import { usersQueryOptionsFactory } from "../users-query-options-factory";

/** Display fields for signed-in chrome (header, composers). Not a session/token store. */
export type Viewer = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type ViewerSource = {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

export function viewerFrom(
  profile: ViewerSource | undefined,
  sessionUser: ViewerSource | null | undefined,
): Viewer | null {
  const source = profile ?? sessionUser ?? null;
  if (!source) {
    return null;
  }

  return {
    id: source.id,
    username: source.username,
    displayName: source.displayName ?? null,
    avatarUrl: source.avatarUrl ?? null,
  };
}

/**
 * Live viewer for chrome. Prefers `GET /users/me` (invalidated on profile save).
 * Falls back to the auth session snapshot until that query lands.
 */
export function useViewer(): Viewer | null {
  const { user, isAuthenticated } = useAuth();
  const { data: profile } = useQuery({
    ...usersQueryOptionsFactory.myProfile(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  return viewerFrom(profile, user);
}
