import { useEffect } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import { PostCard } from "./post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import type { PostQueryDto } from "../types";

type PostFeedProps = {
  queryDto?: Partial<Omit<PostQueryDto, "page">>;
};

export const PostFeed = ({ queryDto }: PostFeedProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(postsQueryOptionsFactory.feedList(queryDto));

  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    rootMargin: "200px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data.pages.flatMap((page) => page.items);

  if (allPosts.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No posts yet. Be the first to post!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Sentinel element — triggers next page fetch when scrolled into view */}
      <div ref={loadMoreRef} className="h-1" />

      {isFetchingNextPage && <FeedSkeleton count={1} />}

      {!hasNextPage && (
        <p className="text-center text-sm text-muted-foreground py-4">
          You've reached the end
        </p>
      )}
    </div>
  );
};

export const FeedSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    ))}
  </div>
);
