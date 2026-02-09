import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToggleLike } from "../hooks/use-toggle-like";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";

type LikeButtonProps = {
  targetId: string;
  targetType: "POST" | "ARTICLE";
  isLiked: boolean;
  likesCount: number;
};

export const LikeButton = ({
  targetId,
  targetType,
  isLiked,
  likesCount,
}: LikeButtonProps) => {
  const { isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const { toggle } = useToggleLike(targetId, targetType);

  const handleClick = () => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    toggle(isLiked);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "gap-2",
        isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground",
      )}
      onClick={handleClick}
    >
      <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
      <span className="text-xs">{likesCount}</span>
    </Button>
  );
};
