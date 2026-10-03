import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth.context";
import { useSignInModal } from "@/features/auth/sign-in-modal.context";
import { getApiError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useToggleSave } from "../hooks/use-toggle-save";
import type { SavedTargetType } from "../types";

type SaveButtonProps = {
  targetId: string;
  targetType: Extract<SavedTargetType, "POST" | "ARTICLE">;
  isSaved: boolean;
  className?: string;
};

export const SaveButton = ({
  targetId,
  targetType,
  isSaved,
  className,
}: SaveButtonProps) => {
  const { isAuthenticated } = useAuth();
  const { open: openSignIn } = useSignInModal();
  const { toggle } = useToggleSave(targetId, targetType);

  const handleClick = () => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    toggle(isSaved, {
      onError: (error) => {
        const errorCode = getApiError(error).errorCode;
        if (errorCode === "ALREADY_SAVED" || errorCode === "NOT_SAVED") {
          return;
        }
        toast.error(
          isSaved ? "Couldn’t remove this save" : "Couldn’t save this",
        );
      },
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "gap-2",
        isSaved ? "text-primary hover:text-primary" : "text-muted-foreground",
        className,
      )}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved" : "Save"}
      onClick={handleClick}
    >
      <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
    </Button>
  );
};
