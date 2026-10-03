import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/features/auth/auth.context";
import { getApiError } from "@/lib/errors";
import { articleDetailPath, articleEditPath } from "@/lib/routes.constants";
import { articlesQueryOptionsFactory } from "../articles-query-options-factory";
import { useUpdateArticle } from "../hooks/use-update-article";
import { ArticleDeleteDialog } from "./article-delete-dialog";
import { ArticleEditor } from "./article-editor";
import type { CreateArticleDto } from "../types";

type EditArticleFormProps = {
  slug: string;
};

export const EditArticleForm = ({ slug }: EditArticleFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: article } = useSuspenseQuery(
    articlesQueryOptionsFactory.details(slug),
  );
  const updateArticle = useUpdateArticle();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const isOwner = Boolean(user && article.author?.id === user.id);

  if (!isOwner) {
    return (
      <EmptyState
        icon={Lock}
        title="You can’t edit this article"
        description="Only the author can change or delete it."
      >
        <Button
          className="mt-4"
          asChild
        >
          <Link to={articleDetailPath(article.slug)}>View article</Link>
        </Button>
      </EmptyState>
    );
  }

  const toUpdateDto = (data: CreateArticleDto) => ({
    title: data.title,
    content: data.content,
    coverImageUrl: data.coverImageUrl ?? null,
    isPublished: data.isPublished,
    topicIds: data.topicIds ?? [],
  });

  const handleSubmit = async (data: CreateArticleDto) => {
    try {
      const updated = await updateArticle.mutateAsync({
        id: article.id,
        dto: toUpdateDto(data),
      });
      toast.success("Article updated!");
      navigate(articleDetailPath(updated.slug));
    } catch (error) {
      toast.error(getApiError(error).message ?? "Could not update article");
      throw error;
    }
  };

  // Saves from the leave dialog: the editor resumes the blocked navigation.
  const handleSaveDraft = async (data: CreateArticleDto) => {
    try {
      await updateArticle.mutateAsync({
        id: article.id,
        dto: toUpdateDto(data),
      });
      toast.success("Draft saved");
    } catch (error) {
      toast.error(getApiError(error).message ?? "Could not save draft");
      throw error;
    }
  };

  const handleAutosave = async (data: CreateArticleDto) => {
    try {
      const updated = await updateArticle.mutateAsync({
        id: article.id,
        dto: { ...toUpdateDto(data), isPublished: false },
      });
      if (updated.slug !== slug) {
        navigate(articleEditPath(updated.slug), { replace: true });
      }
    } catch (error) {
      toast.error(getApiError(error).message ?? "Could not save draft");
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <ArticleEditor
        key={article.id}
        initialTitle={article.title}
        initialContent={article.content}
        initialCoverImageUrl={article.coverImageUrl ?? ""}
        initialTopicIds={article.topics.map((topic) => topic.id)}
        onSubmit={handleSubmit}
        onSaveDraft={article.isPublished ? undefined : handleSaveDraft}
        onAutosave={article.isPublished ? undefined : handleAutosave}
        isSubmitting={updateArticle.isPending}
        submitLabel={article.isPublished ? "Save" : "Publish"}
      />
      <div className="border-t pt-6">
        <Button
          type="button"
          variant="destructive"
          className="w-full sm:w-auto"
          onClick={() => setDeleteOpen(true)}
        >
          Delete article
        </Button>
      </div>
      <ArticleDeleteDialog
        article={article}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
};
