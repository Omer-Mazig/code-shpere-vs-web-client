import type { components } from "@/lib/api-types";

export type Notification = components["schemas"]["NotificationResponseDto"];
export type UnreadNotificationsCount =
  components["schemas"]["UnreadCountResponseDto"];
export type MarkAllReadResponse =
  components["schemas"]["MarkAllReadResponseDto"];
export type NotificationType = Notification["type"];
export type NotificationTargetType = NonNullable<Notification["targetType"]>;
export type NotificationReadFilter = "all" | "read" | "unread";
export type NotificationPayload = Notification["payload"] & {
  actorId?: string;
  actorName?: string;
  actorAvatarUrl?: string | null;
  postId?: string;
  postExcerpt?: string;
  commentId?: string;
  commentExcerpt?: string;
  parentCommentId?: string;
  replyCommentId?: string;
  replyExcerpt?: string;
  targetType?: "POST" | "ARTICLE" | "USER";
  targetId?: string;
  articleSlug?: string;
  createdAt?: string;
};

export type NotificationsStreamUnreadCountEvent = {
  count: number;
};
