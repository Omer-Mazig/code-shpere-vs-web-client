import React from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getApiError } from "@/lib/errors";
import { useAuth } from "@/features/auth/auth.context";
import { useBlockUser } from "../hooks/use-block-user";

type ProfileBlockMenuProps = {
  userId: string;
  displayName: string;
  isBlocked: boolean;
};

export const ProfileBlockMenu = ({
  userId,
  displayName,
  isBlocked,
}: ProfileBlockMenuProps) => {
  const { isAuthenticated, user } = useAuth();
  const { blockMutation, unblockMutation } = useBlockUser(userId);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  if (!isAuthenticated || user?.id === userId) {
    return null;
  }

  const handleBlock = async () => {
    try {
      await blockMutation.mutateAsync();
      toast.success("User blocked");
      setConfirmOpen(false);
    } catch (error) {
      if (getApiError(error).errorCode === "USER_ALREADY_BLOCKED") {
        setConfirmOpen(false);
        return;
      }
      toast.error(getApiError(error).message ?? "Could not block this user");
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockMutation.mutateAsync();
      toast.success("User unblocked");
    } catch (error) {
      if (getApiError(error).errorCode === "USER_NOT_BLOCKED") {
        return;
      }
      toast.error(getApiError(error).message ?? "Could not unblock this user");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="More profile actions"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isBlocked ? (
            <DropdownMenuItem
              disabled={unblockMutation.isPending}
              onClick={() => void handleUnblock()}
            >
              Unblock
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              Block
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will not be able to message you. You can unblock them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={blockMutation.isPending}
              onClick={() => void handleBlock()}
            >
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
