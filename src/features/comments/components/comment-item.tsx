import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import { LikeButton } from "@/features/interactions/components/like-button";
import { CommentForm } from "./comment-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Comment } from "../types";

type CommentItemProps = {
  comment: Comment;
  targetId: string;
  targetType: "POST" | "ARTICLE";
  activeReplyId: string | null;
  onReplyClick: (commentId: string | null) => void;
  isNew?: boolean;
};

const COMMENT_MENTION_REGEX = /(@[a-zA-Z0-9_-]{3,30})/g;

const renderCommentContent = (comment: Comment) => {
  const mentionMap = new Map(
    comment.mentionedUsers.map((user) => [user.username.toLowerCase(), user]),
  );
  const parts = comment.content.split(COMMENT_MENTION_REGEX);

  return parts.map((part, index) => {
    const mentionMatch = /^@([a-zA-Z0-9_-]{3,30})$/.exec(part);
    if (!mentionMatch) {
      return <span key={`${comment.id}-part-${index}`}>{part}</span>;
    }

    const username = mentionMatch[1].toLowerCase();
    const mentionedUser = mentionMap.get(username);
    if (!mentionedUser) {
      return <span key={`${comment.id}-part-${index}`}>{part}</span>;
    }

    return (
      <Link
        key={`${comment.id}-part-${index}`}
        to={`/profile/${mentionedUser.id}`}
        className="text-primary hover:underline"
      >
        @{mentionedUser.username}
      </Link>
    );
  });
};

export const CommentItem = ({
  comment,
  targetId,
  targetType,
  activeReplyId,
  onReplyClick,
  isNew,
}: CommentItemProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHighlighting, setIsHighlighting] = useState(isNew ?? false);

  useEffect(() => {
    if (!isNew) return;

    setIsHighlighting(true);
    const timeout = setTimeout(() => {
      setIsHighlighting(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, [isNew]);

  const isTopLevelComment = comment.parentId === null;
  const canReply = isTopLevelComment;
  const isReplying = activeReplyId === comment.id;
  const hasReplies = isTopLevelComment && comment.repliesCount > 0;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      ...commentsQueryOptionsFactory.replies(comment.id),
      enabled: hasReplies,
    });

  const replies = React.useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const newestReply = replies.length > 0 ? replies[replies.length - 1] : null;
  const hiddenRepliesCount = comment.repliesCount - 1;

  return (
    <div
      className={
        isHighlighting
          ? "rounded-lg bg-primary/5 py-3 animate-[pulse_0.6s_ease-out]"
          : "py-3"
      }
    >
      <div className="flex gap-3">
        {comment.author && (
          <Link
            to={`/profile/${comment.author.id}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium"
          >
            {comment.author.displayName?.[0]?.toUpperCase() ??
              comment.author.username[0].toUpperCase()}
          </Link>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {comment.author && (
              <Link
                to={`/profile/${comment.author.id}`}
                className="text-sm font-medium hover:underline"
              >
                {comment.author.displayName ?? comment.author.username}
              </Link>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">
            {renderCommentContent(comment)}
          </p>

          <div className="flex items-center gap-2">
            <LikeButton
              targetId={comment.id}
              targetType="COMMENT"
              isLiked={comment.isLiked}
              likesCount={comment.likesCount}
            />

            {canReply && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground"
                onClick={() => onReplyClick(isReplying ? null : comment.id)}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">Reply</span>
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="pt-1">
              <CommentForm
                targetId={targetId}
                targetType={targetType}
                parentId={comment.id}
                onSuccess={() => onReplyClick(null)}
              />
            </div>
          )}

          {hasReplies && (
            <div className="ml-2 border-l pl-3 space-y-3">
              {isLoading ? (
                <ReplySkeleton />
              ) : isExpanded ? (
                <>
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      targetId={targetId}
                      targetType={targetType}
                      activeReplyId={activeReplyId}
                      onReplyClick={onReplyClick}
                    />
                  ))}

                  {hasNextPage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? "Loading..." : "Load more replies"}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {hiddenRepliesCount > 0 && (
                    <button
                      type="button"
                      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsExpanded(true)}
                    >
                      See {hiddenRepliesCount} more{" "}
                      {hiddenRepliesCount === 1 ? "reply" : "replies"}
                    </button>
                  )}
                  {newestReply && (
                    <CommentItem
                      comment={newestReply}
                      targetId={targetId}
                      targetType={targetType}
                      activeReplyId={activeReplyId}
                      onReplyClick={onReplyClick}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReplySkeleton = () => (
  <div className="flex gap-3 py-3">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);
