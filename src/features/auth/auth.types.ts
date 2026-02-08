export type RoleType = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  roles: RoleType[];
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
};
