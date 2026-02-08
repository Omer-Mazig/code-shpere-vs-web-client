import { useQuery } from "@tanstack/react-query";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import { PostCard } from "./post-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostQueryDto } from "../types";

type PostFeedProps = {
  queryDto?: Partial<PostQueryDto>;
};

export const PostFeed = ({ queryDto }: PostFeedProps) => {
  const { data, isLoading, isError } = useQuery(
    postsQueryOptionsFactory.feedList(queryDto),
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
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
  }

  if (isError) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Failed to load posts.</p>
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data.items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
