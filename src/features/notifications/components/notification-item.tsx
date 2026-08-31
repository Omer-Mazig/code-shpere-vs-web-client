import { formatDistanceToNow } from "date-fns";
import React from "react";
import type { MouseEventHandler } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/components/shared/user-avatar";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import type { Notification } from "../types";
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read";
import {
  getNotificationHref,
  getNotificationTargetInfo,
  getNotificationVerb,
  getNotificationCollapsedOthers,
} from "../notification-links";

type NotificationItemProps = {
  notification: Notification;
  dropdownOpen: boolean;
};

export const NotificationItem = ({
  notification,
  dropdownOpen,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const markAsReadMutation = useMarkNotificationRead();
  const payload = notification.payload;
  const href = getNotificationHref(payload);
  const actorName = payload.actorName;
  const actorHref = `/profile/${payload.actorId}`;
  const collapsedOthers = getNotificationCollapsedOthers(payload);
  const targetInfo = getNotificationTargetInfo(payload);
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.8 });

  React.useEffect(() => {
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
        <AvatarFallback>{getUserInitials({ displayName: actorName })}</AvatarFallback>
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
          )}
          {collapsedOthers?.kind === "named" ? (
            <>
              {" "}
              and{" "}
              <Link
                to={`/profile/${collapsedOthers.actorId}`}
                className="font-semibold underline-offset-2 hover:underline"
              >
                {collapsedOthers.actorName}
              </Link>
            </>
          ) : collapsedOthers?.kind === "count" ? (
            <>
              {" "}
              and {collapsedOthers.count}{" "}
              {collapsedOthers.count === 1 ? "other" : "others"}
            </>
          ) : null}{" "}
          {getNotificationVerb(notification.type)}
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
          {formatDistanceToNow(
            new Date(notification.updatedAt ?? notification.createdAt),
            {
              addSuffix: true,
            },
          )}
        </p>
      </div>
    </div>
  );
};
