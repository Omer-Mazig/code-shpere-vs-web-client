import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import type { Article } from "../types";
import { LikeButton } from "@/features/interactions/components/like-button";
import { SaveButton } from "@/features/saved/components/save-button";
import { UserAvatar, getUserDisplayName } from "@/components/shared/user-avatar";
import { RelativeTime } from "@/components/shared/relative-time";
import { FollowButton } from "@/features/users/components/follow-button";
import { TopicChips } from "@/features/topics/components/topic-chips";
import { ArticleMarkdown } from "./article-markdown";
import { ArticleOwnerMenu } from "./article-owner-menu";
import { estimateReadTimeMinutes } from "../article-body";
import { useAuth } from "@/features/auth/auth.context";

type ArticleViewProps = {
  article: Article;
};

export const ArticleView = ({ article }: ArticleViewProps) => {
  const { user } = useAuth();
  const readTime = estimateReadTimeMinutes(article.content);
  const isOwner = Boolean(user && article.author?.id === user.id);

  return (
    <article className="mx-auto w-full max-w-3xl">
      {article.coverImageUrl && (
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <h1 className="text-3xl font-bold tracking-tight leading-tight md:text-5xl">
        {article.title}
      </h1>
      <TopicChips
        topics={article.topics}
        className="mt-4 flex flex-wrap gap-1.5"
      />

      {article.author && (
        <div className="mt-6 mb-10 flex items-center gap-3 border-b pb-8">
          <Link
            to={`/profile/${article.author.id}`}
            className="shrink-0"
            aria-label={getUserDisplayName(article.author)}
          >
            <UserAvatar
              user={article.author}
              size="lg"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              to={`/profile/${article.author.id}`}
              className="text-sm font-medium hover:underline"
            >
              {article.author.displayName ?? article.author.username}
            </Link>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <RelativeTime date={article.createdAt} />
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readTime} min read
              </span>
            </p>
          </div>
          {isOwner ? (
            <ArticleOwnerMenu article={article} />
          ) : (
            <FollowButton
              userId={article.author.id}
              isFollowing={article.author.isFollowing}
            />
          )}
        </div>
      )}

      <ArticleMarkdown markdown={article.content} />

      <div className="mt-10 flex items-center gap-2 border-t pt-4">
        <LikeButton
          targetId={article.id}
          targetType="ARTICLE"
          isLiked={article.isLiked}
          likesCount={article.likesCount}
        />
        <SaveButton
          targetId={article.id}
          targetType="ARTICLE"
          isSaved={article.isSaved}
        />
      </div>
    </article>
  );
};
