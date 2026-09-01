import { Link } from "react-router-dom";
import { Clock, Heart, MessageCircle } from "lucide-react";
import type { Article } from "../types";
import { UserAvatar } from "@/components/shared/user-avatar";
import { RelativeTime } from "@/components/shared/relative-time";
import { TopicChips } from "@/features/topics/components/topic-chips";
import {
  estimateReadTimeMinutes,
  excerptFromMarkdown,
} from "../article-body";

type ArticleCardProps = {
  article: Article;
};

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const excerpt = excerptFromMarkdown(article.content);
  const readTime = estimateReadTimeMinutes(article.content);
  const commentsCount = article.commentsCount ?? 0;

  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {article.coverImageUrl ? (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-1.5 w-full bg-linear-to-r from-primary/70 via-primary/40 to-transparent" />
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <TopicChips
          topics={article.topics}
          className="mt-2 flex flex-wrap gap-1.5"
        />
        {excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {article.author ? (
            <div className="flex min-w-0 items-center gap-2">
              <UserAvatar
                user={article.author}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {article.author.displayName ?? article.author.username}
                </p>
                <RelativeTime
                  date={article.createdAt}
                  className="text-xs text-muted-foreground"
                />
              </div>
            </div>
          ) : (
            <span />
          )}

          <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readTime} min
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {article.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {commentsCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
