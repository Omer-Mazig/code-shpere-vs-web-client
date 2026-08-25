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
  USER_MENTIONED: "mentioned you",
};

export function getNotificationHref(payload: NotificationPayload): string {
  switch (payload.type) {
    case "NEW_FOLLOWER":
      return `/profile/${payload.actorId}`;
    case "POST_LIKED":
    case "POST_COMMENTED":
      return `/feed/${payload.postId}`;
    case "COMMENT_REPLIED":
      if (payload.targetType === "POST") {
        return `/feed/${payload.targetId}`;
      }
      if (payload.targetType === "ARTICLE" && payload.articleSlug) {
        return `/articles/${payload.articleSlug}`;
      }
      return "/feed";
    case "USER_MENTIONED":
      if (payload.targetType === "POST" && payload.postId) {
        return `/feed/${payload.postId}`;
      }
      if (payload.targetType === "ARTICLE" && payload.articleSlug) {
        return `/articles/${payload.articleSlug}`;
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
        href: `/feed/${payload.postId}`,
        label: payload.postExcerpt || "your post",
      };
    case "POST_COMMENTED":
      return {
        href: `/feed/${payload.postId}`,
        label: payload.commentExcerpt || payload.postExcerpt || "your post",
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

export function getNotificationVerb(type: NotificationType): string {
  return NOTIFICATION_VERBS[type];
}
