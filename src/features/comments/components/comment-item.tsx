import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import { CommentForm } from "./comment-form";
import { LikeButton } from "@/features/interactions/components/like-button";
import { Button } from "@/components/ui/button";
import type { Comment } from "../types";

type CommentItemProps = {
  comment: Comment;
  targetId: string;
  targetType: "POST" | "ARTICLE";
};

const MAX_DEPTH = 2;

export const CommentItem = ({
  comment,
  targetId,
  targetType,
}: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const canReply = comment.depth < MAX_DEPTH;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...commentsQueryOptionsFactory.replies(comment.id),
    enabled: isRepliesOpen && comment.repliesCount > 0,
  });

  const replies = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  return (
    <div className="py-3">
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
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

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
                onClick={() => setIsReplying((prev) => !prev)}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">Reply</span>
              </Button>
            )}

            {comment.repliesCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setIsRepliesOpen((prev) => !prev)}
              >
                {isRepliesOpen
                  ? "Hide replies"
                  : `Show replies (${comment.repliesCount})`}
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="pt-1">
              <CommentForm
                targetId={targetId}
                targetType={targetType}
                parentId={comment.id}
                onSuccess={() => {
                  setIsReplying(false);
                  setIsRepliesOpen(true);
                }}
              />
            </div>
          )}

          {isRepliesOpen && (
            <div className="ml-2 border-l pl-3 space-y-3">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  targetId={targetId}
                  targetType={targetType}
                />
              ))}

              {hasNextPage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Loading..." : "Load more replies"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
