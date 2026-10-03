export const AUTH_PATHS = {
  AUTH: "/auth",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  CHECK_EMAIL: "/auth/check-email",
  VERIFY_EMAIL: "/auth/verify-email",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
} as const;

export const FEED_PATHS = {
  FEED: "/feed",
  POST_DETAIL: "/feed/:id",
} as const;

export const DRAFT_PATHS = {
  DRAFTS: "/drafts",
} as const;

export const SAVED_PATHS = {
  SAVED: "/saved",
} as const;

export const ARTICLE_PATHS = {
  ARTICLES: "/articles",
  ARTICLE_DETAIL: "/articles/:slug",
  CREATE_ARTICLE: "/articles/new",
  EDIT_ARTICLE: "/articles/:slug/edit",
} as const;

export const PROFILE_PATHS = {
  PROFILE: "/profile/:id",
} as const;

export const SETTINGS_PATHS = {
  ROOT: "/settings",
  PROFILE: "/settings/profile",
  ACCOUNT: "/settings/account",
  NOTIFICATIONS: "/settings/notifications",
} as const;

export const NOTIFICATION_PATHS = {
  NOTIFICATIONS: "/notifications",
} as const;

export const TOPIC_PATHS = {
  TOPICS: "/topics",
  TOPIC_DETAIL: "/topics/:slug",
} as const;

export const CHAT_PATHS = {
  MESSAGES: "/messages",
  THREAD: "/messages/:conversationId",
} as const;

export function topicDetailPath(slug: string) {
  return `/topics/${slug}`;
}

export function articleDetailPath(slug: string) {
  return `/articles/${slug}`;
}

export function articleEditPath(slug: string) {
  return `/articles/${slug}/edit`;
}

export function chatThreadPath(conversationId: string) {
  return `/messages/${conversationId}`;
}

export function profilePath(userId: string) {
  return `/profile/${userId}`;
}
