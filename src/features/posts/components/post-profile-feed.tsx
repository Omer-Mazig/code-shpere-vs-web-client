import { useEffect } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import { PostProfileCard } from "./post-profile-card";
import { FeedSkeleton } from "./post-feed";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

type PostProfileFeedProps = {
  userId: string;
};

export const PostProfileFeed = ({ userId }: PostProfileFeedProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    postsQueryOptionsFactory.feedList({ authorId: userId }),
  );

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
          This user has not posted yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {allPosts.map((post) => (
        <PostProfileCard key={post.id} post={post} />
      ))}

      <div ref={loadMoreRef} className="h-1" />

      {isFetchingNextPage && <FeedSkeleton count={1} />}

      {!hasNextPage && (
        <p className="text-center text-sm text-muted-foreground py-4">
          End of posts
        </p>
      )}
    </div>
  );
};
