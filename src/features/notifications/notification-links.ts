import type { NotificationPayload, NotificationType } from "./types";

export type NotificationTargetInfo = {
  href: string;
  label: string;
};

const NOTIFICATION_VERBS: Record<NotificationType, string> = {
  POST_LIKED: "liked your post",
  POST_COMMENTED: "commented on your post",
  COMMENT_REPLIED: "replied to your comment",
  NEW_FOLLOWER: "started following you",
};

export function getNotificationHref(
  type: NotificationType,
  payload: NotificationPayload,
): string {
  if (type === "NEW_FOLLOWER" && payload.actorId) {
    return `/profile/${payload.actorId}`;
  }

  if ((type === "POST_LIKED" || type === "POST_COMMENTED") && payload.postId) {
    return `/feed/${payload.postId}`;
  }

  if (type === "COMMENT_REPLIED") {
    if (payload.targetType === "POST" && payload.targetId) {
      return `/feed/${payload.targetId}`;
    }
    if (payload.targetType === "ARTICLE" && payload.articleSlug) {
      return `/articles/${payload.articleSlug}`;
    }
  }

  return "/feed";
}

export function getNotificationTargetInfo(
  type: NotificationType,
  payload: NotificationPayload,
): NotificationTargetInfo | null {
  if (type === "POST_LIKED" && payload.postId) {
    return {
      href: `/feed/${payload.postId}`,
      label: payload.postExcerpt ?? "your post",
    };
  }

  if (type === "POST_COMMENTED" && payload.postId) {
    return {
      href: `/feed/${payload.postId}`,
      label: payload.commentExcerpt ?? payload.postExcerpt ?? "your post",
    };
  }

  if (
    type === "COMMENT_REPLIED" &&
    payload.targetType === "POST" &&
    payload.targetId
  ) {
    return {
      href: `/feed/${payload.targetId}`,
      label: payload.replyExcerpt ?? "your comment",
    };
  }

  if (
    type === "COMMENT_REPLIED" &&
    payload.targetType === "ARTICLE" &&
    payload.articleSlug
  ) {
    return {
      href: `/articles/${payload.articleSlug}`,
      label: payload.replyExcerpt ?? "your comment",
    };
  }

  return null;
}

export function getNotificationVerb(type: NotificationType): string {
  return NOTIFICATION_VERBS[type];
}
