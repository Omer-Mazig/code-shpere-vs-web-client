import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import type { Post as PostType } from "../types";
import { PostActions } from "./post-actions";
import { FollowButton } from "@/features/users/components/follow-button";
import { usersQueryOptionsFactory } from "@/features/users/users-query-options-factory";
import { useAuth } from "@/features/auth/auth.context";

type PostContextValue = {
  post: PostType;
};

const PostContext = React.createContext<PostContextValue | undefined>(undefined);

const usePost = () => {
  const context = React.useContext(PostContext);
  if (!context) {
    throw new Error("Post compound components must be used within Post.Root");
  }
  return context.post;
};

type PostRootProps = {
  post: PostType;
  children: React.ReactNode;
  className?: string;
};

const Root = ({ post, children, className }: PostRootProps) => {
  return (
    <PostContext.Provider value={{ post }}>
      <article className={`rounded-lg border bg-card p-4 ${className ?? ""}`}>
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

  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link
          to={`/profile/${post.author.id}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium"
        >
          {post.author.displayName?.[0]?.toUpperCase() ??
            post.author.username[0].toUpperCase()}
        </Link>
        <div className="flex flex-col">
          <Link
            to={`/profile/${post.author.id}`}
            className="text-sm font-medium hover:underline"
          >
            {post.author.displayName ?? post.author.username}
          </Link>
          <span className="text-xs text-muted-foreground">
            @{post.author.username} &middot;{" "}
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
      {rightSlot}
    </div>
  );
};

type PostContentProps = {
  linkToDetail?: boolean;
};

const Content = ({ linkToDetail = true }: PostContentProps) => {
  const post = usePost();

  if (!linkToDetail) {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>;
  }

  return (
    <Link to={`/feed/${post.id}`}>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
    </Link>
  );
};

const CommentPreview = () => {
  const post = usePost();

  return (
    <>
      {post.latestComment && (
        <div className="mt-3 rounded-md bg-muted/40 p-3 text-sm">
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
          className="mt-2 block text-xs text-muted-foreground hover:underline"
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
  const post = usePost();

  return (
    <div className="mt-3 border-t pt-2">
      <PostActions
        postId={post.id}
        isLiked={post.isLiked}
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        onCommentClick={onCommentClick}
      />
    </div>
  );
};

const FollowAuthorButton = () => {
  const post = usePost();
  const { isAuthenticated, user } = useAuth();
  const authorId = post.author.id;
  const shouldFetchProfile = isAuthenticated && user?.id !== authorId;

  const { data: authorProfile } = useQuery({
    ...usersQueryOptionsFactory.profile(authorId),
    enabled: shouldFetchProfile,
  });

  return (
    <FollowButton
      userId={authorId}
      isFollowing={authorProfile?.isFollowing ?? false}
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
