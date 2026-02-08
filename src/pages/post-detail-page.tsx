import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { postsQueryOptionsFactory } from "@/features/posts/posts-query-options-factory";
import { PostCard } from "@/features/posts/components/post-card";
import { CommentsSection } from "@/features/comments/components/comments-section";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading } = useQuery(
    postsQueryOptionsFactory.details(id!),
  );

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <p className="text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Link to="/feed">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Button>
      </Link>

      <div className="flex flex-col gap-6">
        <PostCard post={post} />
        <CommentsSection targetId={post.id} targetType="POST" />
      </div>
    </div>
  );
};
