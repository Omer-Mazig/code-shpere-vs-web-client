import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { ArticleList, ArticleListSkeleton } from "./article-list";
import { ArticleListFiltersBar } from "./article-list-filters";
import {
  ARTICLE_LIST_PAGE_SIZE,
  articleListHref,
  parseArticleListSearchParams,
  toArticleListSearchParams,
  type ArticleListFilters,
} from "../article-list-search-params";

export const ArticlesDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseArticleListSearchParams(searchParams);
  const hasActiveFilters = Boolean(
    filters.search || filters.topicId || filters.authorId,
  );

  const applyPatch = useCallback(
    (patch: Partial<ArticleListFilters>, options?: { replace?: boolean }) => {
      setSearchParams(
        (prev) => {
          const current = parseArticleListSearchParams(prev);
          return toArticleListSearchParams({
            ...current,
            ...patch,
            page: patch.page ?? 1,
          });
        },
        { replace: options?.replace ?? false },
      );
    },
    [setSearchParams],
  );

  const queryDto = {
    isPublished: true,
    page: filters.page,
    limit: ARTICLE_LIST_PAGE_SIZE,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.topicId ? { topicId: filters.topicId } : {}),
    ...(filters.authorId ? { authorId: filters.authorId } : {}),
  };

  return (
    <div>
      <ArticleListFiltersBar
        filters={filters}
        onChange={applyPatch}
        onClear={() => setSearchParams(new URLSearchParams(), { replace: true })}
      />
      <QueryBoundary
        fallback={<ArticleListSkeleton />}
        ErrorFallback={InlineErrorFallback}
        resetKeys={[articleListHref(filters)]}
      >
        <ArticleList
          queryDto={queryDto}
          pageHref={(page) => articleListHref({ ...filters, page })}
          onPageChange={(page) => {
            applyPatch({ page });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          hasActiveFilters={hasActiveFilters}
        />
      </QueryBoundary>
    </div>
  );
};
