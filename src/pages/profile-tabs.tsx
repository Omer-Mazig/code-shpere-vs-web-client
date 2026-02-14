import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArticleList } from "@/features/articles/components/article-list";
import { FollowersList } from "@/features/users/components/followers-list";
import { ProfilePosts } from "@/features/users/components/profile-posts";
import { usersQueryOptionsFactory } from "@/features/users/users-query-options-factory";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileLayoutRouteGate } from "./profile-layout-route-gate";

type ConnectionsMode = "followers" | "following";

const ProfileConnectionsTab = ({
  mode,
  profileId,
}: {
  mode: ConnectionsMode;
  profileId: string;
}) => {
  const queryOptions =
    mode === "followers"
      ? usersQueryOptionsFactory.followers(profileId)
      : usersQueryOptionsFactory.following(profileId);
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    rootMargin: "220px",
  });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery(queryOptions);

  const users = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isIntersecting]);

  if (isPending) {
    return (
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
  }

  if (isError) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Failed to load users.
      </p>
    );
  }

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

export const ProfileArticlesTabPage = () => {
  return (
    <ProfileLayoutRouteGate activeTab="articles">
      {({ profileId }) => (
        <ArticleList queryDto={{ authorId: profileId, isPublished: true }} />
      )}
    </ProfileLayoutRouteGate>
  );
};

export const ProfilePostsTabPage = () => {
  return (
    <ProfileLayoutRouteGate activeTab="posts">
      {({ profileId }) => <ProfilePosts userId={profileId} />}
    </ProfileLayoutRouteGate>
  );
};

export const ProfileFollowersTabPage = () => {
  return (
    <ProfileLayoutRouteGate activeTab="followers">
      {({ profileId }) => (
        <ProfileConnectionsTab
          mode="followers"
          profileId={profileId}
        />
      )}
    </ProfileLayoutRouteGate>
  );
};

export const ProfileFollowingTabPage = () => {
  return (
    <ProfileLayoutRouteGate activeTab="following">
      {({ profileId }) => (
        <ProfileConnectionsTab
          mode="following"
          profileId={profileId}
        />
      )}
    </ProfileLayoutRouteGate>
  );
};

export const ProfileIndexRedirectPage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return (
      <Navigate
        to="/feed"
        replace
      />
    );
  }
  return (
    <Navigate
      to={`/profile/${id}/posts`}
      replace
    />
  );
};
