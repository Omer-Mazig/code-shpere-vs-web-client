import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import type { Article } from "../types";

type ArticleCardProps = {
  article: Article;
};

export const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group block rounded-lg border bg-card overflow-hidden transition-colors hover:border-foreground/20"
    >
      {article.coverImageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>

        {article.author && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {article.author.displayName?.[0]?.toUpperCase() ??
                article.author.username[0].toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground">
              {article.author.displayName ?? article.author.username}
            </span>
            <span className="text-xs text-muted-foreground">
              &middot;{" "}
              {formatDistanceToNow(new Date(article.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};
