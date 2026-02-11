import { MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/features/interactions/components/like-button";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";

type PostActionsProps = {
  postId: string;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onCommentClick?: () => void;
};

export const PostActions = ({
  postId,
  isLiked,
  likesCount,
  commentsCount,
  onCommentClick,
}: PostActionsProps) => {
  const { isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();

  const handleAction = (action: () => void) => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    action();
  };

  return (
    <div className="flex items-center gap-1">
      <LikeButton
        targetId={postId}
        targetType="POST"
        isLiked={isLiked}
        likesCount={likesCount}
      />

      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => onCommentClick?.()}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs">{commentsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => handleAction(() => {})}
      >
        <Share2 className="h-4 w-4" />
        <span className="text-xs">Share</span>
      </Button>
    </div>
  );
};
