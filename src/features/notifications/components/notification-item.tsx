import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import type { MouseEventHandler } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import type {
  Notification,
  NotificationPayload,
  NotificationType,
} from "../types";
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read";

type NotificationItemProps = {
  notification: Notification;
  dropdownOpen: boolean;
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
    if (payload.targetType === "ARTICLE" && payload.articleSlug) {
      return `/articles/${payload.articleSlug}`;
    }
  }

  return "/feed";
};

const getTargetInfo = (
  type: NotificationType,
  payload: NotificationPayload,
) => {
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
};

const getInitial = (value?: string) => {
  if (!value) return "?";
  return value.charAt(0).toUpperCase();
};

export const NotificationItem = ({
  notification,
  dropdownOpen,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const markAsReadMutation = useMarkNotificationRead();
  const payload = notification.payload as NotificationPayload;
  const href = getNotificationHref(notification.type, payload);
  const actorName = payload.actorName ?? "User";
  const actorHref = payload.actorId ? `/profile/${payload.actorId}` : null;
  const targetInfo = getTargetInfo(notification.type, payload);
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.8 });

  useEffect(() => {
    if (
      !dropdownOpen ||
      !isIntersecting ||
      notification.isRead ||
      markAsReadMutation.isPending
    ) {
      return;
    }

    markAsReadMutation.mutate(notification.id);
  }, [
    dropdownOpen,
    isIntersecting,
    markAsReadMutation,
    notification.id,
    notification.isRead,
  ]);

  const handleContainerClick: MouseEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("a")) {
      return;
    }
    navigate(href);
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={handleContainerClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(href);
        }
      }}
      className={`flex h-auto w-full cursor-pointer items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
        notification.isRead ? "" : "bg-muted/60"
      }`}
    >
      <Avatar size="sm">
        <AvatarImage
          src={payload.actorAvatarUrl ?? undefined}
          alt={actorName}
        />
        <AvatarFallback>{getInitial(actorName)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-xs leading-5 whitespace-normal wrap-break-word">
          {actorHref ? (
            <Link
              to={actorHref}
              className="font-semibold underline-offset-2 hover:underline"
            >
              {actorName}
            </Link>
          ) : (
            <span className="font-semibold">{actorName}</span>
          )}{" "}
          {notification.type === "POST_LIKED" && "liked your post"}
          {notification.type === "POST_COMMENTED" && "commented on your post"}
          {notification.type === "COMMENT_REPLIED" && "replied to your comment"}
          {notification.type === "NEW_FOLLOWER" && "started following you"}
          {targetInfo ? (
            <>
              :{" "}
              <Link
                to={targetInfo.href}
                className="underline underline-offset-2 hover:text-foreground"
              >
                {targetInfo.label}
              </Link>
            </>
          ) : null}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
};
