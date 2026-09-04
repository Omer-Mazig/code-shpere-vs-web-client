import { Link } from "react-router-dom";
import type { SharedPostPreview } from "../types";
import { UserAvatar } from "@/components/shared/user-avatar";
import { RelativeTime } from "@/components/shared/relative-time";
import { cn } from "@/lib/utils";

type SharedPostEmbedProps = {
  post: SharedPostPreview;
  className?: string;
};

export const SharedPostEmbed = ({ post, className }: SharedPostEmbedProps) => {
  const author = post.author;
  const displayName = author
    ? (author.displayName ?? author.username)
    : "Unknown author";
  const previewImage = post.images[0];

  return (
    <Link
      to={`/feed/${post.id}`}
      className={cn(
        "mt-3 block rounded-xl border bg-muted/30 p-3 transition-colors hover:bg-muted/50",
        className,
      )}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-2 flex items-center gap-2">
        <UserAvatar
          user={author ?? undefined}
          size="sm"
        />
        <div className="min-w-0 flex flex-col">
          <span className="truncate text-sm font-medium">{displayName}</span>
          <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            {author && <span>@{author.username}</span>}
            <span aria-hidden="true">·</span>
            <RelativeTime date={post.createdAt} />
          </div>
        </div>
      </div>
      {previewImage ? (
        <img
          src={previewImage.url}
          alt=""
          className="mb-2 max-h-40 w-full rounded-lg object-cover"
        />
      ) : null}
      {post.content.trim() ? (
        <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed">
          {post.content}
        </p>
      ) : previewImage ? null : (
        <p className="text-sm text-muted-foreground italic">Original post</p>
      )}
    </Link>
  );
};
