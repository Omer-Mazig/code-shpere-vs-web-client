import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMarkAllNotificationsRead } from "../hooks/use-mark-all-notifications-read";
import { useNotificationsList } from "../hooks/use-notifications-list";
import { NotificationItem } from "./notification-item";

type NotificationsDropdownProps = {
  open: boolean;
};

export const NotificationsDropdown = ({ open }: NotificationsDropdownProps) => {
  const notificationsList = useNotificationsList(20, open);
  const markAllReadMutation = useMarkAllNotificationsRead();

  const items =
    notificationsList.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="w-[360px] max-w-[calc(100vw-2rem)]">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-sm font-semibold">Notifications</p>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending || items.length === 0}
        >
          Mark all as read
        </Button>
      </div>

      <Separator />

      {notificationsList.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
          You are all caught up.
        </p>
      ) : (
        <div className="max-h-[420px] space-y-1 overflow-y-auto p-2">
          {items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}

          {notificationsList.hasNextPage ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 w-full"
              onClick={() => notificationsList.fetchNextPage()}
              disabled={notificationsList.isFetchingNextPage}
            >
              {notificationsList.isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};
