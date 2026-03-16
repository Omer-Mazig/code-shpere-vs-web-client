import { useInfiniteQuery } from "@tanstack/react-query";
import type { useCreateComment } from "../hooks/use-create-comment";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import React from "react";
import { CommentItem } from "./comments-item";
import { Button } from "@/components/ui/button";
import { CommentsSkeleton } from "./comments-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

type CommentsListProps = {
  targetId: string;
  targetType: "POST" | "ARTICLE";
  activeReplyId: string | null;
  onReplyClick: (commentId: string | null) => void;
  createComment: ReturnType<typeof useCreateComment>;
};

export const CommentsList = ({
  targetId,
  targetType,
  activeReplyId,
  onReplyClick,
  createComment,
}: CommentsListProps) => {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery(commentsQueryOptionsFactory.thread(targetId, targetType));

  const comments = React.useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
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
