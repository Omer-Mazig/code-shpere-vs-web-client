export const AUTH_PATHS = {
  AUTH: "/auth",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
} as const;

export const FEED_PATHS = {
  FEED: "/feed",
  POST_DETAIL: "/feed/:id",
} as const;

export const ARTICLE_PATHS = {
  ARTICLES: "/articles",
  ARTICLE_DETAIL: "/articles/:slug",
  CREATE_ARTICLE: "/articles/new",
  EDIT_ARTICLE: "/articles/:slug/edit",
} as const;

export const PROFILE_PATHS = {
  PROFILE: "/profile/:id",
  EDIT_PROFILE: "/profile/edit",
} as const;
