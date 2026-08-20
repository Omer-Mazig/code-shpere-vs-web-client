import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import { ArticleCard } from "./article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { ArticleQueryDto } from "../types";

type ArticleListProps = {
  queryDto?: Partial<ArticleQueryDto>;
};

export const ArticleList = ({ queryDto }: ArticleListProps) => {
  const { data, isLoading, isError } = useQuery(
    articlesQueryOptionsFactory.list(queryDto),
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <Skeleton className="aspect-video w-full" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Couldn’t load articles"
        description="Something went wrong. Refresh the page or try again in a moment."
      />
    );
  }

  if (!data?.items.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title={queryDto?.authorId ? "No articles yet" : "No articles yet"}
        description={
          queryDto?.authorId
            ? "Published writing will appear here."
            : "Be the first to publish a long-form piece for the community."
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.items.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
        />
      ))}
    </div>
  );
};
