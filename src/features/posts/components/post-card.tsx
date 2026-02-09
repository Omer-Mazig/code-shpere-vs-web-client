import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "../types";
import { PostActions } from "./post-actions";

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="rounded-lg border bg-card p-4">
      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        <>
          <Link
            to={`/profile/${post.author.id}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium"
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
        </>
      </div>

      {/* Content */}
      <Link to={`/feed/${post.id}`}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {post.content}
        </p>
      </Link>

      {/* Actions */}
      <div className="mt-3 border-t pt-2">
        <PostActions postId={post.id} />
      </div>
    </div>
  );
};
