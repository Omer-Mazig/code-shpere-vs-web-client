import { Link } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { getApiError } from "@/lib/errors";
import { articleEditPath } from "@/lib/routes.constants";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import { useDeleteArticle } from "../hooks/use-delete-article";

export const ArticleDraftsList = () => {
  const { data } = useSuspenseQuery(articlesQueryOptionsFactory.drafts());
  const deleteArticle = useDeleteArticle();

  if (data.items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No article drafts"
        description="Write an article and it will show up here until you publish it."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.items.map((article) => (
        <li
          key={article.id}
          className="rounded-xl border bg-card p-4"
        >
          <p className="font-medium">{article.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Article · saved <RelativeTime date={article.updatedAt} />
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link to={articleEditPath(article.slug)}>Edit</Link>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="w-full sm:w-auto"
              disabled={deleteArticle.isPending}
              onClick={() => {
                void deleteArticle
                  .mutateAsync(article.id)
                  .then(() => {
                    toast.success("Draft deleted");
                  })
                  .catch((error: unknown) => {
                    toast.error(
                      getApiError(error).message ?? "Could not delete draft",
                    );
                  });
              }}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};
