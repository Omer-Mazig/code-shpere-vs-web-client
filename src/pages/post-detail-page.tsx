import { useParams, Link } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { postsQueryOptionsFactory } from "@/features/posts/posts-query-options-factory";
import { PostDetailCard } from "@/features/posts/components/post-detail-card";
import { CommentsSection } from "@/features/comments/components/comments-section";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: post } = useSuspenseQuery(
    postsQueryOptionsFactory.details(id!),
  );

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Link to="/feed">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Button>
      </Link>

      <div className="flex flex-col gap-6">
        <PostDetailCard post={post} />
        <CommentsSection targetId={post.id} targetType="POST" />
      </div>
    </div>
  );
};

export const PostDetailSkeleton = () => (
  <div className="container mx-auto max-w-2xl px-4 py-6">
    <Skeleton className="h-9 w-32 mb-4" />
    <Skeleton className="h-48 w-full rounded-lg" />
  </div>
);
