import { useEffect } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import { PostFeedCard } from "./post-feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import type { useCreatePost } from "../hooks/use-create-post";
import type { PostQueryDto } from "../types";

type PostFeedProps = {
  createPost?: ReturnType<typeof useCreatePost>;
  queryDto?: Partial<Omit<PostQueryDto, "page">>;
};

export const PostFeed = ({ createPost, queryDto }: PostFeedProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(postsQueryOptionsFactory.feedList(queryDto));

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
      <EmptyState
        icon={PenLine}
        title={queryDto?.topicId ? "No posts tagged yet" : "The feed is quiet"}
        description={
          queryDto?.topicId
            ? "Be the first to tag a post with this topic from the composer."
            : "Share a snippet, a win, or a question — be the first post this community sees."
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {createPost?.isPending && (
        <div className="opacity-80">
          <FeedSkeleton count={1} />
        </div>
      )}
      {allPosts.map((post) => (
        <PostFeedCard
          key={post.id}
          post={post}
          isNew={post.id === createPost?.lastCreatedPostId}
        />
      ))}

      {/* Sentinel element — triggers next page fetch when scrolled into view */}
      <div
        ref={loadMoreRef}
        className="h-1"
      />

      {isFetchingNextPage && <FeedSkeleton count={1} />}

      {!hasNextPage && (
        <p className="text-center text-sm text-muted-foreground py-4">
          You’re all caught up
        </p>
      )}
    </div>
  );
};

export const FeedSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-xl border bg-card p-4 shadow-xs"
      >
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
