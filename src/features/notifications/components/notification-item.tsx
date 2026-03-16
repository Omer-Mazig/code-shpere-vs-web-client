import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Notification, NotificationPayload, NotificationType } from "../types";
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read";

type NotificationItemProps = {
  notification: Notification;
};

const getNotificationHref = (
  type: NotificationType,
  payload: NotificationPayload,
): string => {
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
  }

  return "/feed";
};

const getNotificationText = (
  type: NotificationType,
  payload: NotificationPayload,
): string => {
  const actor = payload.actorName ?? "Someone";

  if (type === "POST_LIKED") {
    return `${actor} liked your post: "${payload.postExcerpt ?? "your post"}"`;
  }

  if (type === "POST_COMMENTED") {
    return `${actor} commented on your post: "${payload.commentExcerpt ?? "a comment"}"`;
  }

  if (type === "COMMENT_REPLIED") {
    return `${actor} replied to your comment: "${payload.replyExcerpt ?? "a reply"}"`;
  }

  return `${actor} started following you`;
};

const getInitial = (value?: string) => {
  if (!value) return "?";
  return value.charAt(0).toUpperCase();
};

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const navigate = useNavigate();
  const markAsReadMutation = useMarkNotificationRead();
  const payload = notification.payload as NotificationPayload;
  const href = getNotificationHref(notification.type, payload);
  const text = getNotificationText(notification.type, payload);
  const actorName = payload.actorName ?? "User";

  const handleClick = async () => {
    try {
      if (!notification.isRead) {
        await markAsReadMutation.mutateAsync(notification.id);
      }
    } finally {
      navigate(href);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`h-auto w-full justify-start gap-3 rounded-lg px-2 py-2 text-left ${
        notification.isRead ? "" : "bg-muted/60"
      }`}
    >
      <Avatar size="sm">
        <AvatarImage src={payload.actorAvatarUrl ?? undefined} alt={actorName} />
        <AvatarFallback>{getInitial(actorName)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs leading-5">{text}</p>
        <p className="text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </Button>
  );
};
