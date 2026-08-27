import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/auth.context";
import { useNotificationStream } from "../hooks/use-notification-stream";
import { useUnreadNotificationsCount } from "../hooks/use-unread-notifications-count";
import { NotificationsDropdown } from "./notifications-dropdown";

export const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = React.useState(false);
  const unreadCountQuery = useUnreadNotificationsCount(isAuthenticated);

  useNotificationStream(isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  const count = unreadCountQuery.data?.count ?? 0;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label={
            count > 0
              ? `Notifications, ${count} unread`
              : "Notifications"
          }
        >
          <Bell
            className="h-5 w-5"
            aria-hidden="true"
          />
          {count > 0 ? (
            <Badge
              aria-hidden="true"
              className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
            >
              {count > 99 ? "99+" : count}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="p-0"
      >
        <NotificationsDropdown open={open} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
