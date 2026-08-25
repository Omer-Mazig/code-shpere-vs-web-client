import type { components, paths } from "@/lib/api-types";

export type Notification = components["schemas"]["NotificationResponseDto"];
export type UnreadNotificationsCount =
  components["schemas"]["UnreadCountResponseDto"];
export type MarkAllReadResponse =
  components["schemas"]["MarkAllReadResponseDto"];
export type StreamTokenResponse =
  components["schemas"]["StreamTokenResponseDto"];
export type NotificationType = Notification["type"];
export type NotificationTargetType = NonNullable<Notification["targetType"]>;
export type NotificationPayload = Notification["payload"];
export type NotificationReadFilter = "all" | "read" | "unread";
export type NotificationsQueryDto = NonNullable<
  paths["/api/notifications"]["get"]["parameters"]["query"]
>;
export type NotificationsListFilters = Pick<
  NotificationsQueryDto,
  "targetType" | "isRead"
>;
export type NotificationsStreamUnreadCountEvent = UnreadNotificationsCount;
