import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComment } from "../hooks/use-create-comment";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";

type CommentFormProps = {
  targetId: string;
  targetType: "POST" | "ARTICLE";
  parentId?: string;
  onSuccess?: () => void;
};

export const CommentForm = ({
  targetId,
  targetType,
  parentId,
  onSuccess,
}: CommentFormProps) => {
  const { isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const [content, setContent] = React.useState("");
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openSignIn();
      return;
    }

    if (!content.trim()) return;

    await createComment.mutateAsync({
      content: content.trim(),
      targetId,
      targetType,
      parentId,
    });

    setContent("");
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || createComment.isPending}
        >
          {createComment.isPending ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  );
};
