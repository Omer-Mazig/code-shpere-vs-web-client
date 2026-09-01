import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getApiError } from "@/lib/errors";
import { ARTICLE_PATHS } from "@/lib/routes.constants";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import { useDeleteArticle } from "../hooks/use-delete-article";
import type { Article } from "../types";

type ArticleDeleteDialogProps = {
  article: Article;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ArticleDeleteDialog = ({
  article,
  open,
  onOpenChange,
}: ArticleDeleteDialogProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteArticle = useDeleteArticle();

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (deleteArticle.isPending) {
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete article?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove “{article.title}” and its comments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteArticle.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteArticle.isPending}
            onClick={(event) => {
              event.preventDefault();
              deleteArticle.mutate(article.id, {
                onSuccess: () => {
                  queryClient.removeQueries({
                    queryKey: articlesQueryOptionsFactory.details(article.slug)
                      .queryKey,
                  });
                  toast.success("Article deleted");
                  navigate(ARTICLE_PATHS.ARTICLES);
                },
                onError: (error) => {
                  toast.error(
                    getApiError(error).message ?? "Could not delete article",
                  );
                },
              });
            }}
          >
            {deleteArticle.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
