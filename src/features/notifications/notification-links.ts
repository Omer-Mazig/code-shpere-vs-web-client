import type { NotificationPayload } from "./types";

export type NotificationTargetInfo = {
  href: string;
  label: string;
};

const articleHref = (slug: string | undefined) =>
  slug ? `/articles/${slug}` : "/feed";

const postHref = (postId: string | undefined) =>
  postId ? `/feed/${postId}` : "/feed";

export function getNotificationHref(payload: NotificationPayload): string {
  switch (payload.type) {
    case "NEW_FOLLOWER":
      return `/profile/${payload.actorId}`;
    case "POST_LIKED":
    case "POST_COMMENTED":
      return postHref(payload.postId);
    case "ARTICLE_LIKED":
    case "ARTICLE_COMMENTED":
      return articleHref(payload.articleSlug);
    case "COMMENT_REPLIED":
      if (payload.targetType === "POST") {
        return `/feed/${payload.targetId}`;
      }
      if (payload.targetType === "ARTICLE") {
        return articleHref(payload.articleSlug);
      }
      return "/feed";
    case "USER_MENTIONED":
      if (payload.targetType === "POST" && payload.postId) {
        return `/feed/${payload.postId}`;
      }
      if (payload.targetType === "ARTICLE") {
        return articleHref(payload.articleSlug);
      }
      return "/feed";
  }
}

export function getNotificationTargetInfo(
  payload: NotificationPayload,
): NotificationTargetInfo | null {
  switch (payload.type) {
    case "POST_LIKED":
      return {
        href: getNotificationHref(payload),
        label: payload.postExcerpt || "your post",
      };
    case "POST_COMMENTED":
      return {
        href: getNotificationHref(payload),
        label: payload.commentExcerpt || payload.postExcerpt || "your post",
      };
    case "ARTICLE_LIKED":
      return {
        href: getNotificationHref(payload),
        label: payload.articleExcerpt || "your article",
      };
    case "ARTICLE_COMMENTED":
      return {
        href: getNotificationHref(payload),
        label:
          payload.commentExcerpt || payload.articleExcerpt || "your article",
      };
    case "COMMENT_REPLIED":
      if (payload.targetType === "POST") {
        return {
          href: `/feed/${payload.targetId}`,
          label: payload.replyExcerpt || "your comment",
        };
      }
      if (payload.targetType === "ARTICLE" && payload.articleSlug) {
        return {
          href: `/articles/${payload.articleSlug}`,
          label: payload.replyExcerpt || "your comment",
        };
      }
      return null;
    case "NEW_FOLLOWER":
      return null;
    case "USER_MENTIONED": {
      if (payload.targetType === "POST" && payload.postId) {
        return {
          href: `/feed/${payload.postId}`,
          label: payload.excerpt || "you",
        };
      }
      if (payload.targetType === "ARTICLE" && payload.articleSlug) {
        return {
          href: `/articles/${payload.articleSlug}`,
          label: payload.excerpt || "you",
        };
      }
      return null;
    }
  }
}

export function getNotificationVerb(payload: NotificationPayload): string {
  switch (payload.type) {
    case "POST_LIKED":
      return "liked your post";
    case "POST_COMMENTED":
      return "commented on your post";
    case "ARTICLE_LIKED":
      return "liked your article";
    case "ARTICLE_COMMENTED":
      return "commented on your article";
    case "COMMENT_REPLIED":
      return "replied to your comment";
    case "NEW_FOLLOWER":
      return "started following you";
    case "USER_MENTIONED":
      return "mentioned you";
  }
}

export type NotificationCollapsedOthers =
  | { kind: "named"; actorId: string; actorName: string }
  | { kind: "count"; count: number };

export function getNotificationCollapsedOthers(
  payload: NotificationPayload,
): NotificationCollapsedOthers | null {
  const actorCount =
    "actorCount" in payload && typeof payload.actorCount === "number"
      ? payload.actorCount
      : 1;
  if (actorCount < 2) {
    return null;
  }

  const actorIds =
    "actorIds" in payload && Array.isArray(payload.actorIds)
      ? payload.actorIds
      : [];
  const actorNames =
    "actorNames" in payload && Array.isArray(payload.actorNames)
      ? payload.actorNames
      : [];
  const secondId = actorIds[1];
  const secondName = actorNames[1];

  if (actorCount === 2 && secondId && secondName) {
    return { kind: "named", actorId: secondId, actorName: secondName };
  }

  return { kind: "count", count: actorCount - 1 };
}
