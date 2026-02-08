import { useQuery } from "@tanstack/react-query";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import { CommentItem } from "./comment-item";
import { CommentForm } from "./comment-form";
import { Skeleton } from "@/components/ui/skeleton";

type CommentsSectionProps = {
  targetId: string;
  targetType: "POST" | "ARTICLE";
};

export const CommentsSection = ({
  targetId,
  targetType,
}: CommentsSectionProps) => {
  const { data, isLoading } = useQuery(
    commentsQueryOptionsFactory.forTarget(targetId, targetType),
  );

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Comments</h3>

      <CommentForm targetId={targetId} targetType={targetType} />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.items.length ? (
        <div className="divide-y">
          {data.items.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};
