import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { articlesQueryOptionsFactory } from "@/features/articles/articles-query-options-factory";
import { ArticleView } from "@/features/articles/components/article-view";
import { CommentsSection } from "@/features/comments/components/comments-section";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useQuery(
    articlesQueryOptionsFactory.details(slug!),
  );

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Skeleton className="h-64 w-full rounded-lg mb-4" />
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <p className="text-muted-foreground">Article not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Link to="/articles">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Button>
      </Link>

      <div className="flex flex-col gap-8">
        <ArticleView article={article} />
        <div className="border-t pt-8">
          <CommentsSection targetId={article.id} targetType="ARTICLE" />
        </div>
      </div>
    </div>
  );
};
