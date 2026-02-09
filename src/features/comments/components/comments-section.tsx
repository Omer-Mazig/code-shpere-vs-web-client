import { useSuspenseQuery } from "@tanstack/react-query";
import { commentsQueryOptionsFactory } from "../comments-query-options-factory";
import { CommentItem } from "./comment-item";
import { CommentForm } from "./comment-form";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";

type CommentsSectionProps = {
  targetId: string;
  targetType: "POST" | "ARTICLE";
};

export const CommentsSection = ({
  targetId,
  targetType,
}: CommentsSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      <CommentForm targetId={targetId} targetType={targetType} />
      <QueryBoundary
        fallback={<CommentsSkeleton />}
        ErrorFallback={InlineErrorFallback}
      >
        <CommentsList targetId={targetId} targetType={targetType} />
      </QueryBoundary>
    </div>
  );
};

const CommentsList = ({ targetId, targetType }: CommentsSectionProps) => {
  const { data } = useSuspenseQuery(
    commentsQueryOptionsFactory.forTarget(targetId, targetType),
  );

  if (data.items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="divide-y">
      {data.items.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

const CommentsSkeleton = () => (
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
);
