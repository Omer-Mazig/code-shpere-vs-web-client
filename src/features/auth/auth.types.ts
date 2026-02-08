export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
};
