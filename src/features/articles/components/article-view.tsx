import { Link } from "react-router-dom";
import type { Article } from "../types";
import { LikeButton } from "@/features/interactions/components/like-button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { RelativeTime } from "@/components/shared/relative-time";

type ArticleViewProps = {
  article: Article;
};

export const ArticleView = ({ article }: ArticleViewProps) => {
  return (
    <article className="mx-auto max-w-3xl">
      {article.coverImageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <h1 className="text-4xl font-bold leading-tight mb-4">
        {article.title}
      </h1>

      {article.author && (
        <div className="flex items-center gap-3 mb-8 pb-8 border-b">
          <Link
            to={`/profile/${article.author.id}`}
            className="shrink-0"
          >
            <UserAvatar
              user={article.author}
              size="lg"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${article.author.id}`}
              className="text-sm font-medium hover:underline"
            >
              {article.author.displayName ?? article.author.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              <RelativeTime date={article.createdAt} />
            </p>
          </div>
        </div>
      )}

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {article.content.map((block, index) => {
          if (block.type === "heading") {
            return (
              <h2 key={index} className="text-2xl font-semibold mt-8 mb-4">
                {String(block.content)}
              </h2>
            );
          }

          if (block.type === "code") {
            return (
              <pre
                key={index}
                className="rounded-lg bg-muted p-4 overflow-x-auto my-4"
              >
                <code className="text-sm">{String(block.content)}</code>
              </pre>
            );
          }

          return (
            <p key={index} className="leading-relaxed mb-4">
              {String(block.content)}
            </p>
          );
        })}
      </div>

      <div className="mt-8 border-t pt-4">
        <LikeButton
          targetId={article.id}
          targetType="ARTICLE"
          isLiked={article.isLiked}
          likesCount={article.likesCount}
        />
      </div>
    </article>
  );
};
