import { useInfiniteQuery } from "@tanstack/react-query";
import type { useCreateComment } from "../hooks/use-create-comment";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import React from "react";
import { CommentItem } from "./comments-item";
import { Button } from "@/components/ui/button";
import { CommentsSkeleton } from "./comments-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageCircle } from "lucide-react";
import type { CommentTargetType } from "../types";

type CommentsListProps = {
  targetId: string;
  targetType: CommentTargetType;
  activeReplyId: string | null;
  onReplyClick: (commentId: string | null) => void;
  createComment: ReturnType<typeof useCreateComment>;
  lastCreatedCommentId: string | null;
  pendingParentId: string | null | undefined;
  setLastCreatedCommentId: (id: string | null) => void;
  setPendingParentId: (id: string | null | undefined) => void;
};

export const CommentsList = ({
  targetId,
  targetType,
  activeReplyId,
  onReplyClick,
  createComment,
  lastCreatedCommentId,
  pendingParentId,
  setLastCreatedCommentId,
  setPendingParentId,
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

  if (comments.length === 0 && pendingParentId !== null) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No comments yet"
        description="Start the conversation — the first comment is often the one others reply to."
        className="py-8"
      />
    );
  }

  return (
    <div className="space-y-1">
      {createComment.isPending && pendingParentId === null && (
        <div className="flex gap-3 px-2 py-2.5 opacity-80">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      )}

      <div className="divide-y divide-border/60">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            targetId={targetId}
            targetType={targetType}
            activeReplyId={activeReplyId}
            onReplyClick={onReplyClick}
            isNew={comment.id === lastCreatedCommentId}
            createComment={createComment}
            lastCreatedCommentId={lastCreatedCommentId}
            pendingParentId={pendingParentId}
            setLastCreatedCommentId={setLastCreatedCommentId}
            setPendingParentId={setPendingParentId}
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
