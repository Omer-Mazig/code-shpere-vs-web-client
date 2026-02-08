import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";

type PostActionsProps = {
  postId: string;
  onCommentClick?: () => void;
};

export const PostActions = ({ postId: _postId, onCommentClick }: PostActionsProps) => {
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
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => handleAction(() => {})}
      >
        <Heart className="h-4 w-4" />
        <span className="text-xs">Like</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => handleAction(() => onCommentClick?.())}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs">Comment</span>
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
