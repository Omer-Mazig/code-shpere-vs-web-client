import React from "react";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { CommentForm } from "./comments-form";
import { useCreateComment } from "../hooks/use-create-comment";
import { CommentsList } from "./comments-list";
import { CommentsSkeleton } from "./comments-skeleton";
import type { CommentTargetType } from "../types";

type CommentsSectionProps = {
  targetId: string;
  targetType: CommentTargetType;
};

export const CommentsSection = ({
  targetId,
  targetType,
}: CommentsSectionProps) => {
  const [activeReplyId, setActiveReplyId] = React.useState<string | null>(null);
  const [lastCreatedCommentId, setLastCreatedCommentId] = React.useState<
    string | null
  >(null);
  const [pendingParentId, setPendingParentId] = React.useState<
    string | null | undefined
  >(undefined);
  const createComment = useCreateComment();

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs">
      <h3 className="text-lg font-semibold">Comments</h3>
      <CommentForm
        targetId={targetId}
        targetType={targetType}
        createComment={createComment}
        setLastCreatedCommentId={setLastCreatedCommentId}
        setPendingParentId={setPendingParentId}
      />
      <QueryBoundary
        fallback={<CommentsSkeleton />}
        ErrorFallback={InlineErrorFallback}
        resetKeys={[targetId, targetType]}
      >
        <CommentsList
          targetId={targetId}
          targetType={targetType}
          activeReplyId={activeReplyId}
          onReplyClick={setActiveReplyId}
          createComment={createComment}
          lastCreatedCommentId={lastCreatedCommentId}
          pendingParentId={pendingParentId}
          setLastCreatedCommentId={setLastCreatedCommentId}
          setPendingParentId={setPendingParentId}
        />
      </QueryBoundary>
    </div>
  );
};
