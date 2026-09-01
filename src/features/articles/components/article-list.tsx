import { useLocation, useSearchParams } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import { ArticleCard } from "./article-card";
import { ArticleListPagination } from "./article-list-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { ArticleQueryDto } from "../types";
import { cn } from "@/lib/utils";
import {
  ARTICLE_LIST_PAGE_SIZE,
  parseArticleListSearchParams,
} from "../article-list-search-params";

type ArticleListProps = {
  queryDto?: Partial<ArticleQueryDto>;
  className?: string;
  pageHref?: (page: number) => string;
  onPageChange?: (page: number) => void;
  hasActiveFilters?: boolean;
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

export const ArticleList = ({
  queryDto,
  className,
  pageHref,
  onPageChange,
  hasActiveFilters = false,
}: ArticleListProps) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = parseArticleListSearchParams(searchParams).page;
  const page = queryDto?.page ?? urlPage;
  const limit = queryDto?.limit ?? ARTICLE_LIST_PAGE_SIZE;
  const listQueryDto = { ...queryDto, page, limit };

  const { data } = useSuspenseQuery(
    articlesQueryOptionsFactory.list(listQueryDto),
  );

  const resolvedPageHref =
    pageHref ??
    ((nextPage: number) => {
      const params = new URLSearchParams(searchParams);
      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
      const query = params.toString();
      return `${location.pathname}${query ? `?${query}` : ""}`;
    });

  const handlePageChange = (nextPage: number) => {
    if (onPageChange) {
      onPageChange(nextPage);
      return;
    }
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(nextPage));
    }
    setSearchParams(next);
  };

  if (!data.items.length) {
    return (
      <div>
        <EmptyState
          icon={BookOpen}
          title={
            hasActiveFilters
              ? "No matching articles"
              : queryDto?.topicId
                ? "No articles tagged yet"
                : "No articles yet"
          }
          description={
            hasActiveFilters
              ? "Try a different search, topic, or author."
              : queryDto?.topicId
                ? "No published articles are tagged with this topic yet."
                : queryDto?.authorId
                  ? "Published writing will appear here."
                  : "Be the first to publish a long-form piece for the community."
          }
        />
        <ArticleListPagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          hasNextPage={data.meta.hasNextPage}
          pageHref={resolvedPageHref}
          onPageChange={handlePageChange}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
          className,
        )}
      >
        {data.items.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
          />
        ))}
      </div>
      <ArticleListPagination
        page={data.meta.page}
        totalPages={data.meta.totalPages}
        hasNextPage={data.meta.hasNextPage}
        pageHref={resolvedPageHref}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
