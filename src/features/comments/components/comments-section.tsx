import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import { CommentItem } from "./comment-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { CommentForm } from "./comment-form";
import { useCreateComment } from "../hooks/use-create-comment";
import type { Comment } from "../types";

type CommentsSectionProps = {
  targetId: string;
  targetType: "POST" | "ARTICLE";
};

export const CommentsSection = ({
  targetId,
  targetType,
}: CommentsSectionProps) => {
  const [activeReplyId, setActiveReplyId] = React.useState<string | null>(null);
  const createComment = useCreateComment();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      <CommentForm
        targetId={targetId}
        targetType={targetType}
        createComment={createComment}
      />
      <QueryBoundary
        fallback={<CommentsSkeleton />}
        ErrorFallback={InlineErrorFallback}
      >
        <CommentsList
          targetId={targetId}
          targetType={targetType}
          activeReplyId={activeReplyId}
          onReplyClick={setActiveReplyId}
          createComment={createComment}
        />
      </QueryBoundary>
    </div>
  );
};

type CommentsListProps = CommentsSectionProps & {
  activeReplyId: string | null;
  onReplyClick: (commentId: string | null) => void;
  createComment: ReturnType<typeof useCreateComment>;
};

const CommentsList = ({
  targetId,
  targetType,
  activeReplyId,
  onReplyClick,
  createComment,
}: CommentsListProps) => {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery(commentsQueryOptionsFactory.thread(targetId, targetType));

  const comments = React.useMemo(
    () => data?.pages.flatMap((page) => page.items as Comment[]) ?? [],
    [data],
  );

  if (isFetching && comments.length === 0) {
    return <CommentsSkeleton />;
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {createComment.isPending && (
        <div className="flex gap-3 py-3 opacity-80">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      )}

      <div className="divide-y">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            targetId={targetId}
            targetType={targetType}
            activeReplyId={activeReplyId}
            onReplyClick={onReplyClick}
            isNew={comment.id === createComment.lastCreatedCommentId}
          />
        ))}
      </div>

      {hasNextPage && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full"
        >
          {isFetchingNextPage ? "Loading..." : "Load more comments"}
        </Button>
      )}
    </div>
  );
};

const CommentsSkeleton = () => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex gap-3 py-3"
      >
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    ))}
  </div>
);
