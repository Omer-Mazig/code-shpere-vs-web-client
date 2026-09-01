import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import { ArticleCard } from "./article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { ArticleQueryDto } from "../types";
import { cn } from "@/lib/utils";

type ArticleListProps = {
  queryDto?: Partial<ArticleQueryDto>;
  className?: string;
};

export const ArticleListSkeleton = () => (
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

export const ArticleList = ({ queryDto, className }: ArticleListProps) => {
  const { data } = useSuspenseQuery(
    articlesQueryOptionsFactory.list(queryDto),
  );

  if (!data.items.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title={queryDto?.topicId ? "No articles tagged yet" : "No articles yet"}
        description={
          queryDto?.topicId
            ? "No published articles are tagged with this topic yet."
            : queryDto?.authorId
            ? "Published writing will appear here."
            : "Be the first to publish a long-form piece for the community."
        }
      />
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {data.items.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
        />
      ))}
    </div>
  );
};
