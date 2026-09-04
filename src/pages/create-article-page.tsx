import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArticleEditor } from "@/features/articles/components/article-editor";
import { useCreateArticle } from "@/features/articles/hooks/use-create-article";
import type { CreateArticleDto } from "@/features/articles/types";
import { getApiError } from "@/lib/errors";
import { articleDetailPath } from "@/lib/routes.constants";

export const CreateArticlePage = () => {
  const navigate = useNavigate();
  const createArticle = useCreateArticle();

  const handleSubmit = async (data: CreateArticleDto) => {
    try {
      const article = await createArticle.mutateAsync(data);
      toast.success("Article created!");
      navigate(articleDetailPath(article.slug));
    } catch (error) {
      toast.error(getApiError(error).message ?? "Could not create article");
      throw error;
    }
  };

  // Saves from the leave dialog: the editor resumes the blocked navigation.
  const handleSaveDraft = async (data: CreateArticleDto) => {
    try {
      await createArticle.mutateAsync(data);
      toast.success("Draft saved");
    } catch (error) {
      toast.error(getApiError(error).message ?? "Could not save draft");
      throw error;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Write an article</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Markdown with a live preview — headings, lists, code, and uploaded images.
      </p>
      <ArticleEditor
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isSubmitting={createArticle.isPending}
      />
    </div>
  );
};
