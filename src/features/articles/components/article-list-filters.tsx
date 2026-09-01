import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/features/auth/auth.context";
import { topicsQueryOptionsFactory } from "@/features/topics/topics-query-options-factory";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import type { ArticleListFilters } from "../article-list-search-params";

type ArticleListFiltersBarProps = {
  filters: ArticleListFilters;
  onChange: (patch: Partial<ArticleListFilters>, options?: { replace?: boolean }) => void;
  onClear: () => void;
};

export const ArticleListFiltersBar = ({
  filters,
  onChange,
  onClear,
}: ArticleListFiltersBarProps) => {
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [prevFilterSearch, setPrevFilterSearch] = useState(filters.search);
  if (filters.search !== prevFilterSearch) {
    setPrevFilterSearch(filters.search);
    setSearchInput(filters.search ?? "");
  }
  const topicsQuery = useQuery({
    ...topicsQueryOptionsFactory.list(user?.id),
    meta: { minPending: false },
  });
  const authorsQuery = useQuery(articlesQueryOptionsFactory.publishedAuthors());

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = searchInput.trim() || undefined;
      if (nextSearch === filters.search) {
        return;
      }
      onChange({ search: nextSearch }, { replace: true });
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [filters.search, onChange, searchInput]);

  const hasActiveFilters = Boolean(
    filters.search || filters.topicId || filters.authorId,
  );

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search titles and body"
          aria-label="Search articles"
          className="pl-9"
        />
      </div>
      <Select
        value={filters.topicId ?? "all"}
        onValueChange={(topicId) =>
          onChange({ topicId: topicId === "all" ? undefined : topicId })
        }
      >
        <SelectTrigger
          aria-label="Filter by topic"
          className="w-full sm:w-48"
        >
          <SelectValue placeholder="All topics" />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectItem value="all">All topics</SelectItem>
          {(topicsQuery.data ?? []).map((topic) => (
            <SelectItem
              key={topic.id}
              value={topic.id}
            >
              {topic.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.authorId ?? "all"}
        onValueChange={(authorId) =>
          onChange({ authorId: authorId === "all" ? undefined : authorId })
        }
      >
        <SelectTrigger
          aria-label="Filter by author"
          className="w-full sm:w-48"
        >
          <SelectValue placeholder="All authors" />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectItem value="all">All authors</SelectItem>
          {(authorsQuery.data ?? []).map((author) => (
            <SelectItem
              key={author.id}
              value={author.id}
            >
              {author.displayName || author.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasActiveFilters ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onClear}
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  );
};
