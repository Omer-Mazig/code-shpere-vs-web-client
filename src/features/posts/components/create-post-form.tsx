import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { useCreatePost } from "../hooks/use-create-post";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";

type CreatePostFormProps = {
  createPost: ReturnType<typeof useCreatePost>;
};

export const CreatePostForm = ({ createPost }: CreatePostFormProps) => {
  const { user, isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const [content, setContent] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openSignIn();
      return;
    }

    if (!content.trim()) return;

    await createPost.mutateAsync({ content: content.trim() });
    toast.success("Post created!");
    setContent("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 shadow-xs"
    >
      <div className="flex gap-3">
        <UserAvatar
          user={user}
          size="lg"
        />
        <Textarea
          placeholder="Share a snippet, a win, or a question with the community…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="min-h-20 max-h-48 field-sizing-content resize-none border-0 bg-transparent px-0 focus-visible:ring-0"
        />
      </div>
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
