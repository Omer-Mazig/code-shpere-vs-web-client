import { useQuery } from "@tanstack/react-query";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import { ArticleCard } from "./article-card";
import { Skeleton } from "@/components/ui/skeleton";
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
          <div key={i} className="rounded-lg border bg-card overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Failed to load articles.</p>
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No articles yet. Be the first to write one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.items.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};
