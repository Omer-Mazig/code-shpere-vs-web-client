import React from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import { useNotificationsList } from "@/features/notifications/hooks/use-notifications-list";
import type {
  NotificationReadFilter,
  NotificationTargetType,
} from "@/features/notifications/types";

const TARGET_TYPE_OPTIONS: Array<{
  value: "all" | NotificationTargetType;
  label: string;
}> = [
  { value: "all", label: "All targets" },
  { value: "POST", label: "Posts" },
  { value: "ARTICLE", label: "Articles" },
  { value: "USER", label: "Users" },
];

const READ_FILTER_OPTIONS: Array<{
  value: NotificationReadFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

export const NotificationsPage = () => {
  const { ref, isIntersecting } = useIntersectionObserver();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTargetType = searchParams.get("targetType");
  const targetType: "all" | NotificationTargetType =
    rawTargetType === "POST" ||
    rawTargetType === "ARTICLE" ||
    rawTargetType === "USER"
      ? rawTargetType
      : "all";
  const readFilter = (searchParams.get("read") ??
    "all") as NotificationReadFilter;

  const filters = React.useMemo(
    () => ({
      targetType: targetType === "all" ? undefined : targetType,
      isRead:
        readFilter === "all" ? undefined : readFilter === "read" ? true : false,
    }),
    [readFilter, targetType],
  );

  const notificationsList = useNotificationsList(20, true, filters);
  const items =
    notificationsList.data?.pages.flatMap((page) => page.items) ?? [];

  React.useEffect(() => {
    if (
      isIntersecting &&
      notificationsList.hasNextPage &&
      !notificationsList.isFetchingNextPage
    ) {
      notificationsList.fetchNextPage();
    }
  }, [
    isIntersecting,
    notificationsList,
    notificationsList.hasNextPage,
    notificationsList.isFetchingNextPage,
  ]);

  const updateSearchParam = (next: { targetType?: string; read?: string }) => {
    const nextParams = new URLSearchParams(searchParams);
    if (next.targetType !== undefined) {
      nextParams.set("targetType", next.targetType);
    }
    if (next.read !== undefined) {
      nextParams.set("read", next.read);
    }
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex flex-wrap gap-2">
          <NativeSelect
            value={targetType}
            onChange={(event) =>
              updateSearchParam({ targetType: event.target.value })
            }
            aria-label="Filter by target type"
            size="sm"
          >
            {TARGET_TYPE_OPTIONS.map((option) => (
              <NativeSelectOption
                key={option.value}
                value={option.value}
              >
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          <NativeSelect
            value={readFilter}
            onChange={(event) =>
              updateSearchParam({ read: event.target.value })
            }
            aria-label="Filter by read state"
            size="sm"
          >
            {READ_FILTER_OPTIONS.map((option) => (
              <NativeSelectOption
                key={option.value}
                value={option.value}
              >
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      {notificationsList.isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          No notifications found for these filters.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              dropdownOpen
            />
          ))}

          <div
            ref={ref}
            className="flex h-12 items-center justify-center"
          >
            {notificationsList.isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
