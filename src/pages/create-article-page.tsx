import { useNavigate } from "react-router-dom";
import { ArticleEditor } from "@/features/articles/components/article-editor";
import { useCreateArticle } from "@/features/articles/hooks/use-create-article";
import type { CreateArticleDto } from "@/features/articles/types";

export const CreateArticlePage = () => {
  const navigate = useNavigate();
  const createArticle = useCreateArticle();

  const handleSubmit = async (data: CreateArticleDto) => {
    const article = await createArticle.mutateAsync(data);
    navigate(`/articles/${article.slug}`);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Write an article</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Markdown with a live preview — headings, lists, code, and images from URLs.
      </p>
      <ArticleEditor
        onSubmit={handleSubmit}
        isSubmitting={createArticle.isPending}
      />
    </div>
  );
};
