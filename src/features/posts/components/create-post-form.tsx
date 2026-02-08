import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "../hooks/use-create-post";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";

export const CreatePostForm = () => {
  const { isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const [content, setContent] = React.useState("");
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openSignIn();
      return;
    }

    if (!content.trim()) return;

    await createPost.mutateAsync({ content: content.trim() });
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4">
      <Textarea
        placeholder="What's on your mind? Share with the dev community..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="resize-none border-0 bg-transparent focus-visible:ring-0"
      />
      <div className="mt-3 flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || createPost.isPending}
        >
          {createPost.isPending ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  );
};
