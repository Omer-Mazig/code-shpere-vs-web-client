import { useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArticleList } from "@/features/articles/components/article-list";
import { FollowersList } from "@/features/users/components/followers-list";
import { ProfilePosts } from "@/features/users/components/profile-posts";
import { usersQueryOptionsFactory } from "@/features/users/users-query-options-factory";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfilePageContext } from "./profile-page";

type ConnectionsMode = "followers" | "following";

export const ProfilePostsTabPage = () => {
  const { profileId } = useProfilePageContext();
  return <ProfilePosts userId={profileId} />;
};

export const ProfileArticlesTabPage = () => {
  const { profileId } = useProfilePageContext();
  return <ArticleList queryDto={{ authorId: profileId, isPublished: true }} />;
};

const ProfileConnectionsTab = ({ mode }: { mode: ConnectionsMode }) => {
  const { profileId } = useProfilePageContext();
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
  } = useInfiniteQuery(
    mode === "followers"
      ? usersQueryOptionsFactory.followers(profileId)
      : usersQueryOptionsFactory.following(profileId),
  );

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
          <div key={index} className="flex items-center gap-3 py-2">
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

      <div ref={loadMoreRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-2">
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

export const ProfileFollowersTabPage = () => {
  return <ProfileConnectionsTab mode="followers" />;
};

export const ProfileFollowingTabPage = () => {
  return <ProfileConnectionsTab mode="following" />;
};

export const ProfileSettingsTabPage = () => {
  const { isOwnProfile } = useProfilePageContext();

  if (!isOwnProfile) {
    return <Navigate to="../posts" replace />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border p-4">
        <h3 className="font-medium">Notification management</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Coming soon. You will be able to manage mention, follow, and content
          updates preferences here.
        </p>
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="font-medium">General info</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile editing controls will live here. We will use section-based
          draft state with explicit save actions to avoid accidental data loss.
        </p>
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="font-medium">More settings</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Future profile and account preferences will be grouped into dedicated
          sections as this area expands.
        </p>
      </section>
    </div>
  );
};
