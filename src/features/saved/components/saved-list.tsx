import { Link } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { articleDetailPath } from "@/lib/routes.constants";
import { savedQueryOptionsFactory } from "../saved-query-options-factory";
import { SaveButton } from "./save-button";

export const SavedList = () => {
  const { data } = useSuspenseQuery(savedQueryOptionsFactory.list());

  if (data.items.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Nothing saved yet"
        description="Save a post or an article and it will show up here. Only you can see this list."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.items.map((item) => {
        if (item.targetType === "POST" && item.post) {
          const author =
            item.post.author?.displayName ??
            item.post.author?.username ??
            "Unknown";
          return (
            <li
              key={item.id}
              className="rounded-xl border bg-card p-4"
            >
              <p className="text-xs text-muted-foreground">
                Post · {author} · saved <RelativeTime date={item.createdAt} />
              </p>
              <Link
                to={`/feed/${item.post.id}`}
                className="mt-2 block line-clamp-3 whitespace-pre-wrap text-sm hover:underline"
              >
                {item.post.content.trim() || "Post"}
              </Link>
              <div className="mt-2 flex justify-end">
                <SaveButton
                  targetId={item.post.id}
                  targetType="POST"
                  isSaved
                />
              </div>
            </li>
          );
        }

        if (item.targetType === "ARTICLE" && item.article) {
          const author =
            item.article.author?.displayName ??
            item.article.author?.username ??
            "Unknown";
          return (
            <li
              key={item.id}
              className="rounded-xl border bg-card p-4"
            >
              <p className="text-xs text-muted-foreground">
                Article · {author} · saved{" "}
                <RelativeTime date={item.createdAt} />
              </p>
              <Link
                to={articleDetailPath(item.article.slug)}
                className="mt-2 block font-medium hover:underline"
              >
                {item.article.title}
              </Link>
              <div className="mt-2 flex justify-end">
                <SaveButton
                  targetId={item.article.id}
                  targetType="ARTICLE"
                  isSaved
                />
              </div>
            </li>
          );
        }

        return (
          <li
            key={item.id}
            className="rounded-xl border bg-card p-4"
          >
            <p className="text-sm text-muted-foreground">
              This {item.targetType.toLowerCase()} is no longer available.
            </p>
            {item.targetType !== "EVENT" && (
              <div className="mt-2 flex justify-end">
                <SaveButton
                  targetId={item.targetId}
                  targetType={item.targetType}
                  isSaved
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};
