import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import type { Comment } from "../types";

type CommentItemProps = {
  comment: Comment;
};

export const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="flex gap-3 py-3">
      {comment.author && (
        <Link
          to={`/profile/${comment.author.id}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium"
        >
          {comment.author.displayName?.[0]?.toUpperCase() ??
            comment.author.username[0].toUpperCase()}
        </Link>
      )}
      <div className="flex-1">
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
        <p className="mt-1 text-sm">{comment.content}</p>
      </div>
    </div>
  );
};
