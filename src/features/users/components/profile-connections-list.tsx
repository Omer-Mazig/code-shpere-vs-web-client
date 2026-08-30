import { useEffect, useMemo } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { FollowersList } from "./followers-list";
import { usersQueryOptionsFactory } from "../users-query-options-factory";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";

type ConnectionsMode = "followers" | "following";

type ProfileConnectionsListProps = {
  mode: ConnectionsMode;
  profileId: string;
};

const ConnectionsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-3 py-2"
      >
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    ))}
  </div>
);

const ProfileConnectionsListContent = ({
  mode,
  profileId,
}: ProfileConnectionsListProps) => {
  const queryOptions =
    mode === "followers"
      ? usersQueryOptionsFactory.followers(profileId)
      : usersQueryOptionsFactory.following(profileId);
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    rootMargin: "220px",
  });
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(queryOptions);

  const users = useMemo(
    () => data.pages.flatMap((page) => page.items),
    [data],
  );

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isIntersecting]);

  return (
    <div className="space-y-3">
      <FollowersList
        users={users}
        emptyMessage={
          mode === "followers"
            ? "No followers yet."
            : "Not following anyone yet."
        }
      />

      <div
        ref={loadMoreRef}
        className="h-1"
      />

      {isFetchingNextPage && (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 py-2"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasNextPage && users.length > 0 && (
        <p className="py-2 text-center text-xs text-muted-foreground">
          End of list
        </p>
      )}
    </div>
  );
};

export const ProfileConnectionsList = ({
  mode,
  profileId,
}: ProfileConnectionsListProps) => (
  <QueryBoundary
    fallback={<ConnectionsSkeleton />}
    ErrorFallback={InlineErrorFallback}
    resetKeys={[mode, profileId]}
  >
    <ProfileConnectionsListContent
      mode={mode}
      profileId={profileId}
    />
  </QueryBoundary>
);
