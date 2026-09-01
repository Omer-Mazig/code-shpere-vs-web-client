import { ArticlesDirectory } from "@/features/articles/components/articles-directory";

export const ArticlesPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <p className="text-muted-foreground mt-1">
          Discover in-depth articles from the developer community.
        </p>
      </div>
      <ArticlesDirectory />
    </div>
  );
};
