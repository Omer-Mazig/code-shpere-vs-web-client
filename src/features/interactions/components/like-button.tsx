import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToggleLike } from "../hooks/use-toggle-like";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { getApiError } from "@/lib/errors";
import type { LikeTargetType } from "../types";

type LikeButtonProps = {
  targetId: string;
  targetType: LikeTargetType;
  isLiked: boolean;
  likesCount: number;
  className?: string;
};

export const LikeButton = ({
  targetId,
  targetType,
  isLiked,
  likesCount,
  className,
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
    toggle(isLiked, {
      onError: (error) => {
        const errorCode = getApiError(error).errorCode;
        if (errorCode === "ALREADY_LIKED" || errorCode === "NOT_LIKED") {
          return;
        }
        setJustLiked(false);
        toast.error(
          `Failed to ${isLiked ? "unlike" : "like"} this ${targetType.toLowerCase()}`,
        );
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "gap-2",
        isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground",
        className,
      )}
      aria-pressed={isLiked}
      aria-label={
        isLiked ? `Unlike, ${likesCount}` : `Like, ${likesCount}`
      }
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
