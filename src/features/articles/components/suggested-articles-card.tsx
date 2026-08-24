import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Heart, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SideCard } from "@/components/shared/side-card";
import { useAuth } from "@/features/auth/auth.context";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import { ARTICLE_PATHS } from "@/lib/routes.constants";
import type { Article } from "../types";

const SUGGESTIONS_LIMIT = 4;

const SuggestedArticleRow = ({
  article,
  index,
}: {
  article: Article;
  index: number;
}) => (
  <Link
    to={`/articles/${article.slug}`}
    className="group flex gap-3"
  >
    <span className="font-mono text-xs font-medium text-primary/60 transition-colors group-hover:text-primary">
      {String(index + 1).padStart(2, "0")}
    </span>
    <div className="min-w-0 flex-1">
      <p className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
        {article.title}
      </p>
      <div className="mt-1 flex items-center gap-2.5 text-[11px] text-muted-foreground">
        <span className="truncate">
          {article.author?.displayName ?? article.author?.username ?? "Unknown"}
        </span>
        <span className="flex shrink-0 items-center gap-0.5 tabular-nums">
          <Heart className="size-3" />
          {article.likesCount}
        </span>
        <span className="flex shrink-0 items-center gap-0.5 tabular-nums">
          <MessageSquare className="size-3" />
          {article.commentsCount ?? 0}
        </span>
      </div>
    </div>
  </Link>
);

const RowsSkeleton = () => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: SUGGESTIONS_LIMIT }, (_, i) => (
      <div
        key={i}
        className="flex gap-3"
      >
        <Skeleton className="h-4 w-5" />
        <div className="flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-1.5 h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

/** Right-rail card with the most-engaged published articles. */
export const SuggestedArticlesCard = () => {
  const { user } = useAuth();
  const { data, isPending, isError } = useQuery(
    articlesQueryOptionsFactory.suggestions(SUGGESTIONS_LIMIT, user?.id),
  );

  if (isError || (data && data.items.length === 0)) return null;

  return (
    <SideCard
      kicker="trending_articles"
      action={
        <Link
          to={ARTICLE_PATHS.ARTICLES}
          className="flex items-center gap-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary"
        >
          view all
          <ArrowUpRight className="size-3" />
        </Link>
      }
    >
      {isPending ? (
        <RowsSkeleton />
      ) : (
        <div className="stagger-children flex flex-col gap-4">
          {data?.items.map((article, index) => (
            <SuggestedArticleRow
              key={article.id}
              article={article}
              index={index}
            />
          ))}
        </div>
      )}
    </SideCard>
  );
};
