import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToggleLike } from "../hooks/use-toggle-like";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import type { LikeTargetType } from "../types";

type LikeButtonProps = {
  targetId: string;
  targetType: LikeTargetType;
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
  // Only pop the heart for likes performed in this session, not pre-liked mounts
  const [justLiked, setJustLiked] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    setJustLiked(!isLiked);
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
      <Heart
        className={cn(
          "h-4 w-4",
          isLiked && "fill-current",
          isLiked && justLiked && "animate-like-pop",
        )}
      />
      <span className="text-xs tabular-nums">{likesCount}</span>
    </Button>
  );
};
