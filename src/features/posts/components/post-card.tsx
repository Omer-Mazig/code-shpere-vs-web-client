import React from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Post as PostType } from "../types";
import { PostActions } from "./post-actions";
import { FollowButton } from "@/features/users/components/follow-button";
import { useAuth } from "@/features/auth/auth.context";
import { UserAvatar } from "@/components/shared/user-avatar";
import { RelativeTime } from "@/components/shared/relative-time";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { useDeletePost } from "../hooks/use-delete-post";
import { useUpdatePost } from "../hooks/use-update-post";
import { postsQueryOptionsFactory } from "../posts-query-options-factory";
import { toast } from "sonner";
import { SharedPostEmbed } from "./shared-post-embed";

const POST_CONTENT_MAX_LENGTH = 5000;

type PostContextValue = {
  post: PostType;
  isOwnPost: boolean;
  isEditing: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  onDeleted?: () => void;
};

const PostContext = React.createContext<PostContextValue | undefined>(
  undefined,
);

const usePostContext = () => {
  const context = React.useContext(PostContext);
  if (!context) {
    throw new Error("Post compound components must be used within Post.Root");
  }
  return context;
};

const usePost = () => usePostContext().post;

type PostRootProps = {
  post: PostType;
  children: React.ReactNode;
  className?: string;
  onDeleted?: () => void;
};

const Root = ({ post, children, className, onDeleted }: PostRootProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const isOwnPost = Boolean(user && post.author?.id === user.id);

  React.useEffect(() => {
    setIsEditing(false);
  }, [post.id]);

  return (
    <PostContext.Provider
      value={{
        post,
        isOwnPost,
        isEditing,
        startEditing: () => setIsEditing(true),
        cancelEditing: () => setIsEditing(false),
        onDeleted,
      }}
    >
      <article
        className={cn(
          "card-hover rounded-xl border bg-card p-4 shadow-xs",
          className,
        )}
      >
        {children}
      </article>
    </PostContext.Provider>
  );
};

type PostHeaderProps = {
  rightSlot?: React.ReactNode;
};

const Header = ({ rightSlot }: PostHeaderProps) => {
  const post = usePost();
  const author = post.author;

  if (!author) {
    return (
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar size="lg" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Unknown author</span>
            <RelativeTime
              date={post.createdAt}
              className="text-xs text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <OwnerMenu />
          {rightSlot}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link
          to={`/profile/${author.id}`}
          className="shrink-0"
        >
          <UserAvatar
            user={author}
            size="lg"
          />
        </Link>
        <div className="min-w-0 flex flex-col">
          <Link
            to={`/profile/${author.id}`}
            className="truncate text-sm font-semibold hover:underline"
          >
            {author.displayName ?? author.username}
          </Link>
          <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            <span>@{author.username}</span>
            <span aria-hidden="true">·</span>
            <RelativeTime date={post.createdAt} />
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <OwnerMenu />
        {rightSlot}
      </div>
    </div>
  );
};

const OwnerMenu = () => {
  const { post, isOwnPost, isEditing, startEditing, onDeleted } =
    usePostContext();
  const queryClient = useQueryClient();
  const deletePost = useDeletePost();
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  if (!isOwnPost || isEditing) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            aria-label="Post actions"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={startEditing}>
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

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (deletePost.isPending) return;
          setDeleteOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your post and its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePost.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletePost.isPending}
              onClick={(event) => {
                event.preventDefault();
                deletePost.mutate(post.id, {
                  onSuccess: () => {
                    onDeleted?.();
                    queryClient.removeQueries({
                      queryKey: postsQueryOptionsFactory.details(post.id)
                        .queryKey,
                    });
                  },
                });
              }}
            >
              {deletePost.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const FENCE_SPLIT_REGEX = /(```[\s\S]*?```)/g;
const FENCE_MATCH_REGEX = /^```(\w+)?\n?([\s\S]*?)```$/;
const INLINE_CODE_SPLIT_REGEX = /(`[^`]+`)/g;

const renderInlineMarkdown = (text: string, keyPrefix: string) => {
  const parts = text.split(INLINE_CODE_SPLIT_REGEX);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={`${keyPrefix}-code-${index}`}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return (
      <React.Fragment key={`${keyPrefix}-text-${index}`}>{part}</React.Fragment>
    );
  });
};

const renderPostContent = (content: string) => {
  const parts = content.split(FENCE_SPLIT_REGEX);
  return parts.map((part, index) => {
    const fence = FENCE_MATCH_REGEX.exec(part);
    if (fence) {
      return (
        <pre
          key={`fence-${index}`}
          className="my-3 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed"
        >
          <code>{fence[2]}</code>
        </pre>
      );
    }
    return (
      <span key={`text-${index}`}>
        {renderInlineMarkdown(part, `p-${index}`)}
      </span>
    );
  });
};

type PostContentProps = {
  linkToDetail?: boolean;
};

const Content = ({ linkToDetail = true }: PostContentProps) => {
  const { post, isEditing, cancelEditing } = usePostContext();
  const updatePost = useUpdatePost();
  const [editContent, setEditContent] = React.useState(post.content);

  React.useEffect(() => {
    setEditContent(post.content);
  }, [post.content, isEditing]);

  const handleSaveEdit = () => {
    const nextContent = editContent.trim();
    if (!nextContent || nextContent === post.content) {
      cancelEditing();
      setEditContent(post.content);
      return;
    }

    if (nextContent.length > POST_CONTENT_MAX_LENGTH) {
      return;
    }

    updatePost.mutate(
      { id: post.id, dto: { content: nextContent } },
      {
        onSuccess: () => cancelEditing(),
        onError: () => {
          toast.error("Failed to update post");
        },
      },
    );
  };

  if (isEditing) {
    const canSave =
      Boolean(editContent.trim()) &&
      editContent.trim() !== post.content &&
      editContent.trim().length <= POST_CONTENT_MAX_LENGTH &&
      !updatePost.isPending;

    return (
      <div className="space-y-2">
        <Textarea
          value={editContent}
          onChange={(event) => setEditContent(event.target.value)}
          rows={4}
          maxLength={POST_CONTENT_MAX_LENGTH}
          className="min-h-20 max-h-64 field-sizing-content resize-none"
        />
        {post.sharedPost && (
          <SharedPostEmbed
            post={post.sharedPost}
            className="pointer-events-none"
          />
        )}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {editContent.length}/{POST_CONTENT_MAX_LENGTH}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                cancelEditing();
                setEditContent(post.content);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canSave}
              onClick={handleSaveEdit}
            >
              {updatePost.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const commentary = post.content.trim() ? (
    <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
      {renderPostContent(post.content)}
    </div>
  ) : null;

  const embed = post.sharedPost ? (
    <SharedPostEmbed post={post.sharedPost} />
  ) : null;

  const linkedCommentary =
    commentary && linkToDetail ? (
      <Link
        to={`/feed/${post.id}`}
        className="block"
      >
        {commentary}
      </Link>
    ) : (
      commentary
    );

  if (!linkedCommentary && !embed) {
    return null;
  }

  return (
    <div>
      {linkedCommentary}
      {embed}
    </div>
  );
};

const CommentPreview = () => {
  const { post, isEditing } = usePostContext();

  if (isEditing) {
    return null;
  }

  return (
    <>
      {post.latestComment && (
        <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
          <span className="font-medium">
            {post.latestComment.author?.displayName ??
              post.latestComment.author?.username ??
              "Unknown"}
          </span>
          <span className="text-muted-foreground"> commented: </span>
          <span className="line-clamp-2">{post.latestComment.content}</span>
        </div>
      )}

      {post.commentsCount > 0 && (
        <Link
          to={`/feed/${post.id}`}
          className="mt-2 block text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Show all comments ({post.commentsCount})
        </Link>
      )}
    </>
  );
};

type PostActionsBarProps = {
  onCommentClick?: () => void;
};

const ActionsBar = ({ onCommentClick }: PostActionsBarProps) => {
  const { post, isEditing } = usePostContext();

  if (isEditing) {
    return null;
  }

  return (
    <div className="mt-3 border-t pt-2">
      <PostActions
        post={post}
        onCommentClick={onCommentClick}
      />
    </div>
  );
};

const FollowAuthorButton = () => {
  const post = usePost();
  const authorId = post.author?.id;

  if (!authorId) {
    return null;
  }

  return (
    <FollowButton
      userId={authorId}
      isFollowing={post.author?.isFollowing ?? false}
    />
  );
};

export const Post = {
  Root,
  Header,
  Content,
  CommentPreview,
  ActionsBar,
  FollowAuthorButton,
};
