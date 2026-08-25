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
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Write an Article</h1>
      <ArticleEditor
        onSubmit={handleSubmit}
        isSubmitting={createArticle.isPending}
      />
    </div>
  );
};
