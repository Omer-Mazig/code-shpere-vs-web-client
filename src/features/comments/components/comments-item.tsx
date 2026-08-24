import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import { LikeButton } from "@/features/interactions/components/like-button";
import { CommentForm } from "./comments-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/user-avatar";
import { RelativeTime } from "@/components/shared/relative-time";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Comment } from "../types";
import type { useCreateComment } from "../hooks/use-create-comment";
import { tokenizeCommentMentions } from "../comment-mentions";
import { useAuth } from "@/features/auth/auth.context";
import { useDeleteComment } from "../hooks/use-delete-comment";
import { useUpdateComment } from "../hooks/use-update-comment";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CommentItemProps = {
  comment: Comment;
  targetId: string;
  targetType: "POST" | "ARTICLE";
  activeReplyId: string | null;
  onReplyClick: (commentId: string | null) => void;
  isNew?: boolean;
  createComment: ReturnType<typeof useCreateComment>;
  lastCreatedCommentId: string | null;
  pendingParentId: string | null | undefined;
  setLastCreatedCommentId: (id: string | null) => void;
  setPendingParentId: (id: string | null | undefined) => void;
};

const renderCommentContent = (comment: Comment) => {
  return tokenizeCommentMentions(comment.content, comment.mentionedUsers).map(
    (token, index) => {
      if (token.type === "mention") {
        return (
          <Link
            key={`${comment.id}-part-${index}`}
            to={`/profile/${token.user.id}`}
            className="text-primary font-medium hover:underline"
          >
            @{token.user.username}
          </Link>
        );
      }

      return <span key={`${comment.id}-part-${index}`}>{token.value}</span>;
    },
  );
};

export const CommentItem = ({
  comment,
  targetId,
  targetType,
  activeReplyId,
  onReplyClick,
  isNew,
  createComment,
  lastCreatedCommentId,
  pendingParentId,
  setLastCreatedCommentId,
  setPendingParentId,
}: CommentItemProps) => {
  const { user } = useAuth();
  const deleteComment = useDeleteComment();
  const updateComment = useUpdateComment();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHighlighting, setIsHighlighting] = useState(isNew ?? false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!isNew) return;

    setIsHighlighting(true);
    const timeout = setTimeout(() => {
      setIsHighlighting(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, [isNew]);

  useEffect(() => {
    setEditContent(comment.content);
  }, [comment.content]);

  const isTopLevelComment = comment.parentId === null;
  const canReply = isTopLevelComment;
  const isReplying = activeReplyId === comment.id;
  const hasReplies = isTopLevelComment && comment.repliesCount > 0;
  const isOwnComment = Boolean(user && comment.author?.id === user.id);
  const isReplyPending =
    createComment.isPending && pendingParentId === comment.id;

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

  const handleSaveEdit = () => {
    const nextContent = editContent.trim();
    if (!nextContent || nextContent === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }

    updateComment.mutate(
      { id: comment.id, dto: { content: nextContent } },
      {
        onSuccess: () => setIsEditing(false),
        onError: () => {
          toast.error("Failed to update comment");
        },
      },
    );
  };

  return (
    <div
      className={cn(
        "-mx-2 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50",
        isHighlighting && "bg-primary/5 animate-[pulse_0.6s_ease-out]",
      )}
    >
      <div className="flex gap-3">
        {comment.author ? (
          <Link
            to={`/profile/${comment.author.id}`}
            className="shrink-0"
          >
            <UserAvatar
              user={comment.author}
              size={isTopLevelComment ? "default" : "sm"}
            />
          </Link>
        ) : (
          <UserAvatar size={isTopLevelComment ? "default" : "sm"} />
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              {comment.author && (
                <Link
                  to={`/profile/${comment.author.id}`}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {comment.author.displayName ?? comment.author.username}
                </Link>
              )}
              {comment.author && (
                <span className="truncate text-xs text-muted-foreground">
                  @{comment.author.username}
                </span>
              )}
              <RelativeTime
                date={comment.createdAt}
                className="text-xs text-muted-foreground"
              />
            </div>

            {isOwnComment && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground"
                    aria-label="Comment actions"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsEditing(true);
                      setEditContent(comment.content);
                    }}
                  >
                    <Pencil />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={2}
                className="min-h-16 max-h-40 field-sizing-content"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!editContent.trim() || updateComment.isPending}
                  onClick={handleSaveEdit}
                >
                  {updateComment.isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {renderCommentContent(comment)}
            </p>
          )}

          {!isEditing && (
            <div className="flex items-center gap-1">
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
          )}

          {isReplying && (
            <div className="pt-2">
              <CommentForm
                targetId={targetId}
                targetType={targetType}
                parentId={comment.id}
                onSuccess={() => onReplyClick(null)}
                createComment={createComment}
                setLastCreatedCommentId={setLastCreatedCommentId}
                setPendingParentId={setPendingParentId}
              />
            </div>
          )}

          {(hasReplies || isReplyPending) && (
            <div className="mt-2 space-y-1 border-l-2 border-border pl-3">
              {isReplyPending && <ReplySkeleton />}

              {hasReplies &&
                (isLoading && !isReplyPending ? (
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
                        createComment={createComment}
                        isNew={reply.id === lastCreatedCommentId}
                        lastCreatedCommentId={lastCreatedCommentId}
                        pendingParentId={pendingParentId}
                        setLastCreatedCommentId={setLastCreatedCommentId}
                        setPendingParentId={setPendingParentId}
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
                        {isFetchingNextPage
                          ? "Loading..."
                          : "Load more replies"}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {hiddenRepliesCount > 0 && (
                      <button
                        type="button"
                        className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                        createComment={createComment}
                        isNew={newestReply.id === lastCreatedCommentId}
                        lastCreatedCommentId={lastCreatedCommentId}
                        pendingParentId={pendingParentId}
                        setLastCreatedCommentId={setLastCreatedCommentId}
                        setPendingParentId={setPendingParentId}
                      />
                    )}
                  </>
                ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (deleteComment.isPending) return;
          setDeleteOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your comment
              {comment.repliesCount > 0 ? " and its replies" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteComment.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteComment.isPending}
              onClick={(event) => {
                event.preventDefault();
                deleteComment.mutate(comment.id);
              }}
            >
              {deleteComment.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const ReplySkeleton = () => (
  <div className="flex gap-3 py-2">
    <Skeleton className="h-6 w-6 rounded-full" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-full" />
    </div>
  </div>
);
